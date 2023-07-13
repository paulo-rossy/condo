const { buildClientSchema, introspectionFromSchema } = require('graphql')
const get = require('lodash/get')
const pluralize = require('pluralize')

class CondoSchemaCleaner {
    constructor (config, introspection) {
        for (const item of config) {
            if (!item || !item.name) {
                throw new Error('No item or item.name provided')
            } else if (!item.operations || !Array.isArray(item.operations) || !item.operations.length) {
                throw new Error('No operations provided')
            } else if (item.operations.length > 1 && item.operations.some(op => !['create', 'read', 'update'].includes(op))) {
                throw new Error('Incorrect operation specified. Expect to be selection of ["create", "read", "update"] or "execute"')
            } else if (!['create', 'read', 'update', 'execute'].includes(item.operations[0])) {
                throw new Error('Incorrect operation specified. Expect to be selection of ["create", "read", "update"] or "execute"')
            } if (item.operations.includes('read') && (!item.fields || typeof item.fields !== 'string')) {
                throw new Error(`Read operation on model ${item.name} is specified, but no fields string provided`)
            } else if (item.operations[0] === 'execute' && (!item.type || !['query', 'mutation'].includes(item.type))) {
                throw new Error('Should specify type (query/mutation) for executable type')
            } else if (item.operations[0] === 'execute' && (!item.fields || typeof item.fields !== 'string')) {
                throw new Error('Should specify return fields for mutation / query')
            }
        }

        this.config = config
        this.introspection = introspection

        this.types = get(introspection, ['__schema', 'types'], []) || []
        this.directives = get(introspection, ['__schema', 'directives'], []) || []
        this.typesByNames = Object.assign({}, ...this.types.map(t => ({ [t.name]: t })))

        this.cleanedTypes = []
        this.queries = []
        this.mutations = []
        this.filteringTypes = []
        this.objectTypes = {}
        this.allowedCreateOnRelations = []
        this.enums = new Set()
    }

    cleanCondoSchema () {
        this.cleanedTypes = []
        this.queries = []
        this.filteringTypes = []
        this.mutations = []
        this.objectTypes = {}
        this.allowedCreateOnRelations = []

        for (const type of this.types) {
            // 1. Add all scalars in output schema
            // 2. Also added all enums here, since some of them are used in directives such as cacheControl
            // 3. Added ks-related and service fields
            if (type.kind === 'SCALAR' || type.name.startsWith('_')) {
                this.cleanedTypes.push(type)
            }
        }

        for (const item of this.config) {
            if (item.operations.includes('create')) {
                this.allowedCreateOnRelations.push(`${item.name}RelateToOneInput`)
            }
        }

        for (const item of this.config) {
            if (item.operations.includes('read')) {
                this.addReadQueries(item.name)
                this.addReadFields(item.name, item.fields)
            }
            if (item.operations.includes('create')) {
                this.addCreateOrUpdateMutations(item.name, 'create')
                this.addCreateOrUpdateTypes(item.name, 'create')
                // NOTE: Need id as a minimal set of fields for return of mutation
                this.addReadFields(item.name, '{ id }')
            }

            if (item.operations.includes('update')) {
                this.addCreateOrUpdateMutations(item.name, 'update')
                this.addCreateOrUpdateTypes(item.name, 'update')
                // NOTE: Need id as a minimal set of fields for return of mutation
                this.addReadFields(item.name, '{ id }')
            }

            if (item.operations.includes('execute')) {
                this.addQueryOrMutation(item.name, item.type)
                const returnType = this.getReturnType(item.name, item.type)
                this.addReadFields(returnType, item.fields)
            }
        }


        this.cleanedTypes.push(...Object.values(this.objectTypes))
        this.addInputFields(this.filteringTypes)

        if ('Query' in this.typesByNames) {
            const queryType = this.typesByNames['Query']
            this.cleanedTypes.push({
                ...queryType,
                fields: queryType.fields.filter(field => this.queries.includes(field.name)),
            })
        }

        if ('Mutation' in this.typesByNames) {
            const mutationType = this.typesByNames['Mutation']
            this.cleanedTypes.push({
                ...mutationType,
                fields: mutationType.fields.filter(field => this.mutations.includes(field.name)),
            })
        }

        this.findUsedEnums()
        this.cleanedTypes.push(
            ...this.types.filter(type => type.kind === 'ENUM' && this.enums.has(type.name))
        )
    }

    /**
     * Form new introspection based on cleaned fields
     */
    getCleanedIntrospection () {
        return {
            '__schema': {
                ...this.introspection.__schema,
                types: this.cleanedTypes,
            },
        }
    }

    getReturnType (itemName, type) {
        const capitalized = type.charAt(0).toUpperCase() + type.slice(1)
        const list = this.getTypeByName(capitalized)
        const fields = get(list, 'fields', [])
        const field = fields.find(field => field.name === itemName)
        let fieldType = field.type
        while (fieldType.ofType) {
            fieldType = fieldType.ofType
        }
        return fieldType.kind === 'OBJECT' ? fieldType.name : null
    }

    /**
     * Adds query or mutation to related list and resolve all needed inputs
     * @param itemName
     * @param type
     */
    addQueryOrMutation (itemName, type) {
        const pluralTypeName = pluralize.plural(type)
        this[pluralTypeName].push(itemName)
        const capitalized = type.charAt(0).toUpperCase() + type.slice(1)
        const list = this.getTypeByName(capitalized)
        const fields = get(list, 'fields', [])
        const field = fields.find(field => field.name === itemName)
        if (!field) {
            throw new Error(`Cannot find ${type} ${itemName} in schema`)
        }

        // Get only INPUT_OBJECT
        const inputs = get(field, 'args', []).map(arg => {
            let fieldType = arg.type
            let fieldKind = fieldType.kind
            while (fieldType.ofType) {
                fieldType = fieldType.ofType
                fieldKind = fieldType.kind
            }
            if (fieldKind === 'INPUT_OBJECT') return fieldType.name
            return null
        }).filter(Boolean)

        this.resolveQueryOrMutationInputs(inputs)
    }

    /**
     * Accept list of input fields and add them to schema resolving recursive
     * @param inputs
     */
    resolveQueryOrMutationInputs (inputs) {
        const queue = inputs
        const addedTypeNames = this.cleanedTypes.map(type => type.name)

        while (queue.length) {
            const typeName = queue.pop()
            const type = this.getTypeByName(typeName)
            if (addedTypeNames.includes(typeName)) {
                continue
            }
            this.cleanedTypes.push(type)

            const inputFields = get(type, 'inputFields', [])
            for (const field of inputFields) {
                let fieldType = field.type
                let fieldKind = fieldType.kind
                while (fieldType.ofType) {
                    fieldType = fieldType.ofType
                    fieldKind = fieldType.kind
                }
                if (fieldKind === 'INPUT_OBJECT') {
                    queue.push(fieldType.name)
                }
            }
        }
    }

    /**
     * Add queries for fetching single / multiple / count objects and types for filtering
     * User -> [allUsers, User, _allUsersMeta]
     * User -> [UserWhereInput, UserWhereUniqueInput]
     * @param itemName name of condo item, such as User
     */
    addReadQueries (itemName) {
        const pluralName = pluralize.plural(itemName)
        this.queries.push(`all${pluralName}`)
        this.queries.push(itemName)
        this.queries.push(`_all${pluralName}Meta`)
        this.filteringTypes.push(`${itemName}WhereInput`)
        this.filteringTypes.push(`${itemName}WhereUniqueInput`)
    }

    /**
     * Filters fields of object, remains only used in fields of condo_config
     * Also resolving related fields if needed
     * @param typeName name of object
     * @param fields gql.js subset of fields which should be wrapped in {} and used single space as separator
     * Example: typeName: "User", fields: "{ dv sender { fingerprint } name }"
     */
    addReadFields (typeName, fields) {
        const type = this.getTypeByName(typeName)
        const remainFieldList = []
        const relatedFields = []

        let deepLevel = 0
        let lastField = null
        let subFields = []
        const tokens = fields.split(' ')

        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i]

            if (token === '{') {
                deepLevel++
                if (deepLevel === 2) {
                    // NOTE: in this scenario we found "field { a b }" part....which means field is OBJECT/RELATION or it's list
                    // That's why deep search for ofType
                    subFields = []
                    const field = type.fields.find((field => field.name === tokens[i - 1]))
                    if (!field) {
                        throw new Error(`No field ${tokens[i - 1]} found on model ${type.name}`)
                    }
                    let fieldType = field.type
                    let fieldKind = fieldType.kind
                    while (fieldKind !== 'OBJECT') {
                        if (!fieldType.ofType) {
                            throw new Error(`Cannot determine relation-type on ${tokens[i - 1]} of ${type.name}`)
                        } else {
                            fieldType = fieldType.ofType
                            fieldKind = fieldType.kind
                        }
                    }
                    lastField = fieldType.name
                }
                if (deepLevel > 1) {
                    subFields.push(token)
                }
            } else if (token === '}') {
                if (deepLevel > 1) {
                    subFields.push(token)
                }
                deepLevel--
                if (deepLevel === 1) {
                    relatedFields.push({ name: lastField, fields: subFields.join(' ') })
                }
            } else {
                if (deepLevel > 1) {
                    subFields.push(token)
                } else {
                    const field = type.fields.find(field => field.name === token)
                    if (!field) {
                        throw new Error(`No field ${token} on model ${typeName}`)
                    }
                    let fieldType = field.type
                    let fieldKind = fieldType.kind
                    while (fieldType.ofType) {
                        fieldType = fieldType.ofType
                        fieldKind = fieldType.kind
                    }
                    if (fieldKind === 'OBJECT' && (i === tokens.length - 1 || tokens[i + 1] !== '{')) {
                        throw new Error(`Field ${token} must have selection of subfields`)
                    }
                    remainFieldList.push(token)
                }
            }
        }

        this.createOrExpand(typeName, remainFieldList)
        for (const item of relatedFields) {
            this.addReadFields(item.name, item.fields)
        }
    }

    /**
     * Add mutation for creating single / multiple objects
     * User -> [createUser, createUsers]
     * @param itemName
     * @param operation create or update
     */
    addCreateOrUpdateMutations (itemName, operation) {
        const pluralName = pluralize.plural(itemName)
        if (operation === 'create') {
            this.mutations.push(`create${itemName}`)
            this.mutations.push(`create${pluralName}`)
        } else if (operation === 'update') {
            this.mutations.push(`update${itemName}`)
            this.mutations.push(`update${pluralName}`)
        }
    }

    addInputFields (fields) {
        const queue = [...fields]
        const addedTypeNames = this.cleanedTypes.map(type => type.name)

        while (queue.length) {
            const typeName = queue.pop()
            if (addedTypeNames.includes(typeName)) {
                continue
            }
            let type = this.getTypeByName(typeName)
            if (typeName.endsWith('RelateToOneInput') && !this.allowedCreateOnRelations.includes(typeName)) {
                type = {
                    ...type,
                    inputFields: type.inputFields.filter(field => field.name !== 'create'),
                }
            }
            this.cleanedTypes.push(type)
            addedTypeNames.push(typeName)
            const inputFieldsName = type.inputFields
                .map(field => {
                    let fieldType = field.type
                    while (fieldType.ofType) {
                        fieldType = fieldType.ofType
                    }
                    return fieldType
                })
                .filter(fieldType => get(fieldType, ['kind']) === 'INPUT_OBJECT')
                .filter(fieldType => !addedTypeNames.includes(get(fieldType, ['name'])))
                .map(fieldType => fieldType.name)
            queue.push(...inputFieldsName)
        }
    }

    /**
     * Adds create / update required types recursively for model
     * Must specify list of allowed for create relations before running
     * @param itemName
     * @param operation create or update
     */
    addCreateOrUpdateTypes (itemName, operation) {
        const pluralName = pluralize.plural(itemName)
        if (operation === 'create') this.addInputFields([`${itemName}CreateInput`, `${pluralName}CreateInput`])
        if (operation === 'update') this.addInputFields([`${itemName}UpdateInput`, `${pluralName}UpdateInput`])
    }

    /**
     * Create object type with filtered fields or expand fields of existing
     * Result is stored in this.objectTypes
     * @param typeName
     * @param fields
     */
    createOrExpand (typeName, fields) {
        const type = this.getTypeByName(typeName)
        if (typeName in this.objectTypes) {
            const createdType = this.objectTypes[typeName]
            const createdFieldNames = createdType.fields.map(field => field.name)
            this.objectTypes[typeName] = {
                ...createdType,
                fields: [...createdType.fields, ...type.fields.filter(field => fields.includes(field.name) && !createdFieldNames.includes(field.name))],
            }
        } else {
            this.objectTypes[typeName] = {
                ...type,
                fields: type.fields.filter(field => fields.includes(field.name)),
            }
        }
    }

    /**
     * Scan cleaned schema and determines which enums are actually used
     */
    findUsedEnums () {
        this.enums = new Set()
        for (const type of this.cleanedTypes) {
            const fields = get(type, 'fields', []) || []
            const inputFields = get(type, 'inputFields', []) || []

            const iterable = [...fields, ...inputFields]
            for (const field of iterable) {
                const enumNames = this.findEnumsFromField(field)
                for (const enumName of enumNames) {
                    this.enums.add(enumName)
                }
            }
        }

        for (const field of this.directives.map(directive => directive.args || []).flat()) {
            const enumNames = this.findEnumsFromField(field)
            for (const enumName of enumNames) {
                this.enums.add(enumName)
            }
        }
    }

    /**
     * Scan field's type and args and return set of enum names, which used in it
     * @param field schema field object
     * @returns {Set<string>} used enums
     */
    findEnumsFromField (field) {
        const enums = new Set()
        let fieldType = field.type
        let fieldKind = fieldType.kind
        while (fieldType.ofType) {
            fieldType = fieldType.ofType
            fieldKind = fieldType.kind
        }
        if (fieldKind === 'ENUM') {
            enums.add(fieldType.name)
        }
        const args = get(field, 'args', []) || []
        for (const arg of args) {
            const argEnums = this.findEnumsFromField(arg)
            for (const enumName of argEnums) {
                enums.add(enumName)
            }
        }

        return enums
    }

    getTypeByName (name) {
        if (!(name in this.typesByNames)) {
            throw new Error(`Expected ${name} type to be in original schema types, but it was not found (or no longer exist)`)
        }
        return this.typesByNames[name]
    }
}

/**
 * Configuration of GraphQL schema slices, that should recursively be extracted from GraphQL schema in question
 *
 * @type SliceConfig
 * @property {String} name - name of GraphQL type
 * @property {String[]} operations - list of GraphQL CRUD operations
 * @property {String} fields - space-separated list of GraphQL type fields
 * @example { name: 'AcquiringIntegrationContext', operations: ['read', 'update'], fields: '{ id name organization { id name } }' }
 */

/**
 * Takes part from provided GraphQL schema, referenced by provided slicing configuration.
 * Slicing configuration specifies GraphQL types with operations and fields, that should be extracted recursively from the schema.
 *
 * Main usage is to extract part of GraphQL schema needed for microservice in question from "condo" GraphQL schema
 * Extracted part will have executor targeted to "condo" endpoint
 * Extracted part will be stitched with schema of the microservice
 * This way a client will get a uniform GraphQL API, that have different executors under the hood
 *
 * @param schema
 * @param {SliceConfig} sliceConfig
 * @example
 * const condoSchema = await loadSchema('../condo/schema.graphql', {
 *     loaders: [new GraphQLFileLoader()],
 * })
 * const sliceConfig = { name: 'AcquiringIntegrationContext', operations: ['read', 'update'], fields: '{ id name organization { id name } }' }
 * const sliceIntrospection = await sliceSchema(condoSchema, sliceConfig)
 * const slicePrint = printSchema(sliceIntrospection)
 * fs.writeFileSync('./condoSchema.graphql', slicePrint)
 */
async function sliceSchema (schema, sliceConfig) {
    const schemaIntrospection = await introspectionFromSchema(schema)
    const cleaner = new CondoSchemaCleaner(sliceConfig, schemaIntrospection)
    cleaner.cleanCondoSchema()
    const cleanedIntrospection = cleaner.getCleanedIntrospection()
    return buildClientSchema(cleanedIntrospection)
}

module.exports = {
    sliceSchema,
}