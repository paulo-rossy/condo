const {
    generate, grey, green, gold, blue, red, volcano, purple, lime, magenta, cyan, geekblue, yellow, orange,
} = require('@ant-design/colors')

const generateCustomColorPalette = (primaryColor, secondaryColor) => {
    const colorPalette = generate(primaryColor)

    if (secondaryColor) {
        colorPalette[6] = secondaryColor
    }

    return colorPalette
}

const sberBlue = '#5EB1FC'
const sberSecondaryBlue = '#3899F1'
const sberGreen = '#4CD174'
const sberSecondaryGreen = '#22BB50'
const sberRed = '#FF4D4F'
const white = '#fff'
const lightGrey = '#D9D9D9'
const sberGrey = '#999999'
const ultraLightGrey = '#F0F0F0'
const inputBorderGrey = '#BFBFBF'
const black = '#000'
const beautifulBlue = '#eFF7FF'
const markColor = '#B5CCFF'
const lightRed = '#FFF1F0'
const brightRed = '#F5222D'
const whiteTranslucent = 'rgba(255, 255, 255, 0.9)'
const indigo = '#5473C3'
const turquoiseBlue = '#6BEAC7'
const malibu = '#5CB2F8'

const CHART_COLOR_SET = [blue[5], green[5], red[4], gold[5], volcano[5], purple[5],
    lime[7], sberGrey[7], magenta[5], blue[4], gold[6], cyan[6],
    blue[7], volcano[6], green[5], geekblue[7], sberGrey[7], gold[7],
    magenta[7], yellow[5], lime[7], blue[8], cyan[5], yellow[6],
    purple[7], lime[8], red[6]]

const colors = {
    sberDefault: generateCustomColorPalette(sberBlue, sberSecondaryBlue),
    sberPrimary: generateCustomColorPalette(sberGreen, sberSecondaryGreen),
    sberDanger: generate(sberRed),
    sberGrey: generate(sberGrey),
    defaultWhite: generate(white),
    lightGrey: generate(lightGrey),
    beautifulBlue: generate(beautifulBlue),
    transparent: 'transparent',
    markColor,
    white,
    black,
    gold,
    red,
    blue,
    green,
    volcano,
    purple,
    lime,
    magenta,
    cyan,
    geekblue,
    yellow,
    ultraLightGrey,
    inputBorderGrey,
    whiteTranslucent,
    lightRed,
    brightRed,
    orange,
    indigo,
    turquoiseBlue,
    malibu,
}

const shadows = {
    elevated: '0px 9px 28px rgba(0, 0, 0, 0.05), 0px 6px 16px rgba(0, 0, 0, 0.08), 0px 3px 6px rgba(0, 0, 0, 0.12)',
}

const transitions = {
    elevateTransition: 'box-shadow 0.2s ease-in-out, border 0.2s ease-in-out',
    easeInOut: 'all .2s ease-in-out',
    allDefault: 'all 0.3s',
}

const gradients = {
    onboardingIconGradient: 'linear-gradient(120deg, #00F260, #0575E6, #00F260)',
}

const DEFAULT_BORDER_WIDTH = '2px'

// Possible customizations can be found at https://github.com/ant-design/ant-design/blob/master/components/style/themes/default.less
const antGlobalVariables = {
    '@border-radius-base': '4px',
    '@white': white,
    '@black': black,
    '@form-item-label-height': '@input-height-base',
    '@label-color': grey[2],
    '@input-border-color': inputBorderGrey,
    '@input-bg': ultraLightGrey,
    '@input-hover-border-color': sberGreen,
    '@select-background': ultraLightGrey,
    '@select-clear-background': ultraLightGrey,
    '@select-border-color': inputBorderGrey,
    '@outline-color': sberGreen,
    '@outline-fade:': 0,
    '@outline-width': '1px',
    '@checkbox-color': sberGreen,
    '@checkbox-check-bg': ultraLightGrey,
    '@checkbox-border-width': DEFAULT_BORDER_WIDTH,
    '@form-item-margin-bottom': '0',
    '@success-color': green[6],
    '@table-border-color': colors.lightGrey[5],
    '@table-header-bg': ultraLightGrey,
    '@tabs-highlight-color': '@black',
    '@tabs-hover-color': '@black',
    '@tabs-active-color': '@black',
    '@tabs-ink-bar-color': '@black',
    '@switch-color': sberGreen,
    '@alert-error-border-color': '@red-2',
    '@alert-error-bg-color': '@red-2',
    '@alert-info-border-color': '@blue-2',
    '@alert-info-bg-color': '@blue-2',
    '@alert-success-border-color': '@green-2',
    '@alert-success-bg-color': '@green-2',
    '@alert-warning-border-color': '@gold-2',
    '@alert-warning-bg-color': '@gold-2',
    '@typography-title-margin-bottom': 0,
    '@tooltip-bg': 'rgba(0, 0, 0)',
    '@text-color-secondary': colors.lightGrey[7],
    '@warning-color': colors.orange[6],
    '@error-color': colors.red[5],
}

module.exports = {
    colors,
    gradients,
    antGlobalVariables,
    shadows,
    transitions,
    CHART_COLOR_SET,
    DEFAULT_BORDER_WIDTH,
}
