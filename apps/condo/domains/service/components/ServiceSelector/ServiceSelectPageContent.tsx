import React from 'react'
import { Typography, Row, Col } from 'antd'
import { useIntl } from '@core/next/intl'
import { PageHeader } from '@condo/domains/common/components/containers/BaseLayout'
import Carousel from '@condo/domains/common/components/Carousel'
import { Section } from './Section'
import { CardsContainer, CardsPerRowType } from './CardsContainer'
import { ServiceCarouselCard } from './ServiceCarouselCard'
import { ServiceSelectCard } from './ServiceSelectCard'
import { hasFeature } from '@condo/domains/common/components/containers/FeatureFlag'
import { useWindowSize } from '@condo/domains/common/hooks/useWindowSize'

const WINDOW_MEDIUM_SELECT_CARD_WIDTH = 870
const WINDOW_SMALL_SELECT_CARD_WIDTH = 550
const WINDOW_MEDIUM_CAROUSEL_CARD_WIDTH = 800
const WINDOW_SMALL_CAROUSEL_CARD_WIDTH = 625
const WINDOW_SMALLEST_CAROUSEL_CARD_WIDTH = 460

export const ServiceSelectPageContent: React.FC = () => {
    // TODO(2420): Add employee rights check
    // TODO(2420): Add select queries

    const intl = useIntl()
    const PageTitle = intl.formatMessage({ id: 'menu.Services' })
    const AlreadyConnectedSectionTitle = intl.formatMessage({ id: 'services.AlreadyConnected' })
    const AvailableSectionTitle = intl.formatMessage({ id: 'services.Available' })

    const { width } = useWindowSize()

    let servicesPerRow: CardsPerRowType = 3
    if (width && width < WINDOW_SMALL_SELECT_CARD_WIDTH) servicesPerRow = 1
    else if (width && width < WINDOW_MEDIUM_SELECT_CARD_WIDTH) servicesPerRow = 2

    let slidesToShow = 4
    if (width && width < WINDOW_SMALLEST_CAROUSEL_CARD_WIDTH) slidesToShow = 1
    else if (width && width < WINDOW_SMALL_CAROUSEL_CARD_WIDTH) slidesToShow = 2
    else if (width && width < WINDOW_MEDIUM_CAROUSEL_CARD_WIDTH) slidesToShow = 3

    // TODO(2420): Add logic
    const isAnyServiceConnected = hasFeature('servicesCarousel')

    return (
        <>
            <PageHeader title={<Typography.Title>{PageTitle}</Typography.Title>} spaced/>
            <Row gutter={[0, 60]}>
                {
                    isAnyServiceConnected &&
                    <Col span={24}>
                        <Section title={AlreadyConnectedSectionTitle}>
                            <Carousel slidesToShow={slidesToShow}>
                                <ServiceCarouselCard
                                    logoSrc={'https://logo.clearbit.com/shopify.com'}
                                    title={'Слушай, что-то я похоже очень большой текст'}
                                    url={'https://www.shopify.com'}
                                />
                                <ServiceCarouselCard
                                    logoSrc={'https://logo.clearbit.com/spotify.comssss'}
                                    title={'Слушай, что-то я похоже очень большой текст'}
                                    url={'https://www.google.com'}
                                />
                                <ServiceCarouselCard
                                    logoSrc={'https://logo.clearbit.com/google.com'}
                                    title={'Слушай, что-то я похоже очень большой текст'}
                                    url={'https://www.google.com'}
                                />
                                <ServiceCarouselCard
                                    logoSrc={'https://logo.clearbit.com/spotify.com'}
                                    title={'Слушай, что-то я похоже очень большой текст'}
                                    url={'https://www.spotify.com'}
                                />
                                <ServiceCarouselCard
                                    title={'Слушай, что-то я похоже очень большой текст'}
                                    url={'/settings?tab=billing'}
                                />
                                <ServiceCarouselCard
                                    logoSrc={'https://logo.clearbit.com/amazon.com'}
                                    title={'Слушай, что-то я похоже очень большой текст'}
                                    url={'https://www.shopify.com'}
                                />
                                <ServiceCarouselCard
                                    logoSrc={'https://logo.clearbit.com/asos.com'}
                                    title={'Слушай, что-то я похоже очень большой текст'}
                                    url={'https://www.google.com'}
                                />
                                <ServiceCarouselCard
                                    logoSrc={'https://logo.clearbit.com/ebay.com'}
                                    title={'Слушай, что-то я похоже очень большой текст'}
                                    url={'https://www.spotify.com'}
                                />
                                <ServiceCarouselCard
                                    logoSrc={'https://logo.clearbit.com/apple.com'}
                                    title={'Слушай, что-то я похоже очень большой текст'}
                                    url={'/settings?tab=billing'}
                                />
                            </Carousel>
                        </Section>
                    </Col>
                }
                <Col span={24}>
                    <Section title={AvailableSectionTitle} hideTitle={!isAnyServiceConnected}>
                        <CardsContainer cardsPerRow={servicesPerRow}>
                            <ServiceSelectCard
                                logoSrc={'https://logo.clearbit.com/shopify.com'}
                                title={'Слушай, что-то я похоже очень большой текст'}
                                url={'https://www.shopify.com'}
                                description={'loremloremloremloremloremlorem loremloremlorem loremloremloremlorem loremloremloremloremlorem loremloremloremloremloremlorem'}
                            />
                            <ServiceSelectCard
                                title={'Я без логотипа'}
                                url={'https://www.shopify.com'}
                                description={'Короткое описание'}
                            />
                            <ServiceSelectCard
                                title={'Я disabled'}
                                url={'https://www.shopify.com'}
                                description={'Короткое описание'}
                                disabled
                            />
                            <ServiceSelectCard
                                title={'У меня есть тэг'}
                                tag={'Крутой тэг'}
                                url={'https://www.shopify.com'}
                                description={'Короткое описание'}
                                disabled
                            />
                            <ServiceSelectCard
                                title={'У меня тоже есть тэг'}
                                logoSrc={'https://logo.clearbit.com/google.com'}
                                tag={'Крутой тэг'}
                                url={'https://www.shopify.com'}
                                description={'Короткое описание'}
                            />
                        </CardsContainer>
                    </Section>
                </Col>
            </Row>
        </>
    )
}
