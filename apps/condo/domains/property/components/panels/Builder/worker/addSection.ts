import { BuildingSection, BuildingUnitType } from '@app/condo/schema'
import { BuildingSectionArg, MapEdit } from '@app/condo/domains/property/components/panels/Builder/MapConstructor'

export function generateSection (mapEdit: MapEdit, section: Partial<BuildingSectionArg>, unitType: BuildingUnitType = BuildingUnitType.Flat): BuildingSection {
    return mapEdit.generateSection(section, unitType)
}
