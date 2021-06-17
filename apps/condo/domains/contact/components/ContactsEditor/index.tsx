import React, { useCallback, useState, useMemo, useRef, useEffect } from 'react'
import { Contact } from '@condo/domains/contact/utils/clientSchema'
import { Contact as TContact } from '../../../../schema'
import { Input, Row, Col, Select, Typography, Radio, Form, FormInstance, Skeleton } from 'antd'
import { Button } from '@condo/domains/common/components/Button'
import { PhoneInput } from '@condo/domains/common/components/PhoneInput'
import { BaseSearchInput } from '../../../common/components/BaseSearchInput'
import { green, grey } from '@ant-design/colors'
import { OptionProps } from 'antd/lib/mentions'
import { useIntl } from '@core/next/intl'
import { PlusCircleFilled } from '@ant-design/icons'

interface ILabelsProps {
    left: React.ReactNode,
    right?: React.ReactNode,
}

const Labels: React.FC<ILabelsProps> = ({ left, right }) => (
    <>
        <Col span={10}>
            <Typography.Text type="secondary">
                {left}
            </Typography.Text>
        </Col>
        <Col span={10}>
            <Typography.Text type="secondary">
                {right}
            </Typography.Text>
        </Col>
        <Col span={2}>
        </Col>
        <Col span={2}>
        </Col>
    </>
)

type ContactFields = {
    name: string,
    phone: string,
}

interface IContactEditorProps {
    form: FormInstance<any>,
    // Customizeable field names of the provided `form`, where editor component will be mounted
    // Fields `clientName` and `clientPhone` are not hardcoded to make this component
    // usable in any form, where contact information fields may be different.
    // Also, this makes usage of the component explicitly, — it's clear, what fields will be set.
    fields: {
        phone: string,
        name: string,
    },
    value?: ContactFields,
    onChange: (contact: ContactFields, isNew: boolean) => void,
    // Contacts for autocomplete will be fetched for specified organization
    organization?: string,
    // Contacts for autocomplete will be fetched for specified property
    property?: string,
    // Contacts for autocomplete will be fetched for specified unit of the property
    unitName?: string,
}

interface IContactsEditorHookArgs {
    // Organization scope for contacts autocomplete and new contact, that can be created
    organization: string,
}

interface IContactsEditorHookResult {
    createContact: (organization: string, property: string, unitName: string) => Promise<void>,
    ContactsEditorComponent: React.FC<IContactEditorProps>,
}

export const useContactsEditorHook = ({ organization }: IContactsEditorHookArgs): IContactsEditorHookResult => {
    // Field value will be initialized only on user interaction.
    // In case of no interaction, no create action will be performed
    const [contactFields, setContactFields] = useState({})
    const [shouldCreateContact, setShouldCreateContact] = useState(false)

    // Closure of `createContact` will be broken, when it will be assigned to another constant outside of this hook
    // Refs are used to keep it

    const contactFieldsRef = useRef(contactFields)
    useEffect(() => {
        contactFieldsRef.current = contactFields
    }, [contactFields])

    const shouldCreateContactRef = useRef(shouldCreateContact)
    useEffect(() => {
        shouldCreateContactRef.current = shouldCreateContact
    }, [shouldCreateContact])

    // eslint-disable-next-line @typescript-eslint/no-empty-function @ts-ignore
    const createContactAction = Contact.useCreate({ }, () => {})

    const handleChangeContact = (values, isNew) => {
        setContactFields(values)
        setShouldCreateContact(isNew)
    }

    const createContact = async (organization, property, unitName) => {
        if (shouldCreateContactRef.current) {
            await createContactAction({
                ...contactFieldsRef.current,
                organization,
                property,
                unitName,
            })
        }
    }

    const ContactsEditorComponent: React.FC<IContactEditorProps> = useMemo(() => {
        const ContactsEditorWrapper = (props) => (
            <ContactsEditor
                {...props}
                organization={organization}
                onChange={handleChangeContact}
            />
        )
        return ContactsEditorWrapper
    }, [])

    return {
        createContact,
        ContactsEditorComponent,
    }
}

export const ContactsEditor: React.FC<IContactEditorProps> = (props) => {
    const { form, fields, value: initialValue, onChange, organization, property, unitName } = props

    const { objs: contacts, loading, error } = Contact.useObjects({
        where: {
            organization: { id: organization },
            property: property ? { id: property } : undefined,
            unitName: unitName || undefined,
        },
    }, {
        fetchPolicy: 'network-only',
    })

    const [selectedContact, setSelectedContact] = useState(null)
    const [value, setValue] = useState(initialValue)
    const [editableFieldsChecked, setEditableFieldsChecked] = useState(false)
    // We need this to keep manually typed information preserved between rerenders
    // with different set of prefetched contacts. For example, when a different unitName is selected,
    // manually typed information should not be lost.
    const [manuallyTypedContact, setManuallyTypedContact] = useState()
    const [displayEditableContactFields, setDisplayEditableContactFields] = useState(!!initialValue)
    const intl = useIntl()
    const FullNameLabel = intl.formatMessage({ id: 'contact.Contact.ContactsEditor.Name' })
    const PhoneLabel = intl.formatMessage({ id: 'contact.Contact.ContactsEditor.Phone' })
    const AddNewContactLabel = intl.formatMessage({ id: 'contact.Contact.ContactsEditor.AddNewContact' })
    const AnotherContactLabel = intl.formatMessage({ id: 'contact.Contact.ContactsEditor.AnotherContact' })


    // It's not enough to have `value` props of `Input` set.
    useEffect(() => {
        if (initialValue) {
            form.setFieldsValue({
                [fields.name]: initialValue.name,
                [fields.phone]: initialValue.phone,
            })
        }
    }, [])

    // When `unitName` was changed from outside, selection is not relevant anymore
    useEffect(() => {
        setSelectedContact(null)
    }, [unitName])

    const handleClickOnPlusButton = () => {
        setDisplayEditableContactFields(true)
        setSelectedContact(null)
        setEditableFieldsChecked(true)
    }

    const handleSelectContact = (contact) => {
        setSelectedContact(contact)
        setEditableFieldsChecked(false)
        triggerOnChange(contact, false)
    }

    const handleChangeContact = (contact) => {
        const isNew = !initialValue || contact.name !== initialValue.name || contact.phone !== initialValue.phone
        triggerOnChange(contact, isNew)
        setManuallyTypedContact(contact)
        setEditableFieldsChecked(true)
        setSelectedContact(null)
    }

    const handleSyncedFieldsChecked = () => {
        setSelectedContact(null)
    }

    const triggerOnChange = (contact, isNew) => {
        form.setFieldsValue({
            [fields.name]: contact.name,
            [fields.phone]: contact.phone,
        })
        setValue(contact)
        onChange && onChange(contact, isNew)
    }

    if (loading) {
        console.log('loading')
        return (
            <Skeleton/>
        )
    }

    if (error) {
        console.warn(error)
        throw error
    }

    return (
        <Col span={24}>
            <Row gutter={[40, 25]}>
                <Labels
                    left={PhoneLabel}
                    right={FullNameLabel}
                />
                {contacts.length === 0 || !unitName ? (
                    <ContactSyncedAutocompleteFields
                        initialValue={initialValue || manuallyTypedContact}
                        onChange={handleChangeContact}
                        contacts={contacts}
                    />
                ) : (
                    <>
                        {contacts.map((contact, i) => (
                            <ContactOption
                                key={contact.id}
                                contact={contact}
                                onSelect={handleSelectContact}
                                selected={selectedContact ? selectedContact.id === contact.id : !editableFieldsChecked && i === 0 }
                            />
                        ))}
                        <>
                            {displayEditableContactFields ? (
                                <>
                                    <Labels
                                        left={AnotherContactLabel}
                                    />
                                    <ContactSyncedAutocompleteFields
                                        initialValue={initialValue || manuallyTypedContact}
                                        onChange={handleChangeContact}
                                        onChecked={handleSyncedFieldsChecked}
                                        checked={editableFieldsChecked}
                                        contacts={contacts}
                                    />
                                </>
                            ) : (
                                <Button
                                    type="link"
                                    style={{ color: green[6] }}
                                    onClick={handleClickOnPlusButton}
                                    icon={<PlusCircleFilled style={{ color: green[6], fontSize: 21 }}/>}
                                >
                                    {AddNewContactLabel}
                                </Button>
                            )}
                        </>
                    </>
                )}
            </Row>
            {value && (
                <>
                    <Form.Item name={fields.name} hidden>
                        <Input value={value.name}/>
                    </Form.Item>
                    <Form.Item name={fields.phone} hidden>
                        <Input value={value.phone}/>
                    </Form.Item>
                </>
            )}
        </Col>
    )
}

/**
 * Prevent crash of `String.match`, when providing a regular expression string value,
 * that containts special characters.
 *
 * @example
 *
 *      someString.match(escapeRegex(value))
 *
 * @see https://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
 */
function escapeRegex (string) {
    return string.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
}

interface IContactSyncedAutocompleteFieldsProps {
    initialValue?: TContact,
    onChange: (contact: ContactFields) => void,
    onChecked?: () => void,
    checked?: boolean,
    // Used for autocomplete
    contacts: TContact[],
}

/**
 * Synchronized pair of "Phone" and "Name" fields.
 * When a phone will be selected, "Name" field should reflect appropriate value for selected contact
 * And vise-versa.
 * When value in fields are typed, not selected, `onChange` callback will be fired.
 */
const ContactSyncedAutocompleteFields: React.FC<IContactSyncedAutocompleteFieldsProps> = ({ initialValue, onChange, onChecked, checked, contacts }) => {
    const [value, setValue] = useState(initialValue)

    const searchContactByPhone = useCallback(async (query) => {
        return contacts.filter(c => c.phone.match(escapeRegex(query)))
    }, [])

    const handleSelectContact = (value: string, option: OptionProps) => {
        setValue(option.data)
    }

    const handleChangeContact = (field) => (fieldValue) => {
        const newValue = {
            ...value,
            [field]: fieldValue,
        }
        setValue(newValue)
        onChange(newValue)
    }

    const renderContactPhoneOption = useCallback(
        (item) => {
            return (
                <Select.Option
                    style={{ textAlign: 'left', color: grey[6] }}
                    key={item.id}
                    value={item.phone}
                    title={item.phone}
                    data={item}
                >
                    {item.phone}
                </Select.Option>
            )
        }, [])

    const handleClearContactByPhone = () => {
        setValue(null)
    }

    const searchContactByName = useCallback(async (query) => {
        return contacts.filter(c => c.name.match(escapeRegex(query)))
    }, [])

    const renderContactNameOption = useCallback(
        (item) => {
            return (
                <Select.Option
                    style={{ textAlign: 'left', color: grey[6] }}
                    key={item.id}
                    value={item.name}
                    title={item.name}
                    data={item}
                >
                    {item.name}
                </Select.Option>
            )
        }, [])

    const handleClearContactByName = () => {
        setValue(null)
    }

    const handleChecked = () => {
        onChecked && onChecked()
    }

    return (
        <>
            <Col span={10}>
                <BaseSearchInput
                    value={value ? value.phone : undefined}
                    loadOptionsOnFocus={false}
                    search={searchContactByPhone}
                    renderOption={renderContactPhoneOption}
                    onSelect={handleSelectContact}
                    onChange={handleChangeContact('phone')}
                    onClear={handleClearContactByPhone}
                    style={{ width: '100%' }}
                />
            </Col>
            <Col span={10}>
                <BaseSearchInput
                    value={value ? value.name : undefined}
                    loadOptionsOnFocus={false}
                    search={searchContactByName}
                    renderOption={renderContactNameOption}
                    onSelect={handleSelectContact}
                    onChange={handleChangeContact('name')}
                    onClear={handleClearContactByName}
                    style={{ width: '100%' }}
                />
            </Col>
            <Col span={2}>
                {onChecked && (
                    <Radio
                        onClick={handleChecked}
                        checked={checked}
                    />
                )}
            </Col>
            <Col span={2}>
            </Col>
        </>
    )
}

interface IContactFieldsDisplayProps {
    contact: TContact,
    onSelect: (contact: TContact) => void,
    selected: boolean,
}

const ContactOption: React.FC<IContactFieldsDisplayProps> = ({ contact, onSelect, selected }) => {
    const handleSelect = () => {
        onSelect(contact)
    }

    return (
        <>
            <Col span={10}>
                <PhoneInput
                    disabled
                    value={contact.phone}
                    style={{ width: '100%' }}
                />
            </Col>
            <Col span={10}>
                <Input
                    disabled
                    value={contact.name}
                />
            </Col>
            <Col span={2}>
                <Radio
                    onClick={handleSelect}
                    checked={selected}
                />
            </Col>
            <Col span={2}>
            </Col>
        </>
    )
}
