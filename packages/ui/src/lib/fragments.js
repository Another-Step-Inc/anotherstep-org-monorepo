export const CtaContactCardSectionFragment = `
  ... on AnotherstepCtaContactCardSection {
    attributes {
      headline
      description
      btn1Text
      btn1Url
      btn2Text
      btn2Url
      directorName
      directorTitle
      directorRegions
      directorPhone
      directorImageUrl,
      directorImageId
    }
  }
`;

export const PageCtaSectionFragment = `
  ... on AnotherstepPageCtaSection {
    attributes {
      ctaTitle
      ctaDescription
      ctaStyle
      btn1Text
      btn1Url
      btn1Style
      btn2Text
      btn2Url
      hasSteps
      step1Text
      step2Text
      step3Text
      hasCard
      cardTitle
      cardDescription
      cardBtnText
      cardBtnUrl
      hasStats
      stat1Number
      stat1Label
      stat2Number
      stat2Label
    }
  }
`;

export const JourneyForwardSectionFragment = `
  ... on AnotherstepJourneyForwardSection {
    attributes {
      sectionTitle
      step1Number
      step1Label
      step2Number
      step2Label
      step3Number
      step3Label
    }
  }
`;

export const UpcomingEventsFragment = `
  ... on AnotherstepUpcomingEvents {
    attributes {
      sectionTitle
      sideTitle
      sideDescription
      saveTheDateText
      meetingTitle
      meetingDescription
      inPersonTitle
      inPersonDetails
      digitalTitle
      zoomUrl
      zoomButtonText
      phoneText
      phoneDetails
      meetingId
    }
  }
`;

export const InclusionAndSupportFragment = `
  ... on AnotherstepInclusionAndSupport {
    attributes {
      title
      resourceTitle
      resourceDescription
      helplineTitle
      helplineNumber
      helplineDescription
    }
    innerBlocks {
      name
      renderedHtml
    }
  }
`;

export const ImportantNoticeFragment = `
  ... on AnotherstepImportantNotice {
    attributes {
      heading
      noticeText
    }
  }
`;

export const CustomGridSectionFragment = `
  ... on AnotherstepCustomGridSection {
    attributes {
      headline
      description
      bgStyle
      textAlignment
      styleVariant
      useQuery
      postType
      postsPerPage
    }
    innerBlocks {
      ... on AnotherstepCustomGridCard {
        attributes {
          title
          content
          icon
          theme
          linkText
          linkUrl
        }
      }
    }
  }
`;

export const GallerySectionFragment = `
    ... on AnotherstepGalleryPlaceholder {
        attributes {
          layoutType
          showFilterBar
          itemsPerPage
          galleryTitle
          galleryDescription
          categorySlug
          tagFilter
          maxItems
        }
    }
`;

export const PageHeroFragment = `
  ... on AnotherstepPageHeroSection {
    attributes {
      layoutType
      heroTitle
      heroDescription
      heroImageUrl
      heroImageId
      imageDecoration
      badgeText
      badgeStyle
      hasBadge
      quoteText
      statsText
      statsNumber
      statsBgColor
      statsTextColor
      isImageLarge
      isStatsRotated
      ctaStyle
      hasExtraTextDiv
      extraDivText
      extraDivIcon
      extraDivIconColor
      extraDivBgColor
      btn1Text
      btn1Url
      btn2Text
      btn2Url
    }
  }
`;

export const HomepageEthicsSectionFragment = `
  ... on AnotherstepHomepageEthicsSection {
    attributes {
      ethicsHeadline
      ethicsLinkText
      ethicsLinkUrl
    }
    innerBlocks {
      name
      renderedHtml
    }
  }
`;

export const SplitFeatureFragment = `
  ... on AnotherstepSplitFeatureSection {
    attributes {
      splitTitle
      splitDescription
      imageAlignment
      backgroundColor
      eyebrowText
      underlineAccent
      mediaId
      mediaUrl
      mediaAlt
      secondaryMediaUrl
      metricNumber
      metricLabel
      iconName
      iconTitle
    }
    innerBlocks {
      name
      renderedHtml
    }
  }
`;

export const TwoColumnCardSectionFragment = `
  ... on AnotherstepTwoColumnCardSection {
    attributes{
      aboutHeadline
      aboutSubHeadline
      aboutImpactHeadline
      aboutImpactTitle1
      aboutImpactParagraph1
      aboutImpactIcon1
      aboutImpactTitle2
      aboutImpactParagraph2
      aboutImpactIcon2
    }
    innerBlocks {
      name
      renderedHtml
    }
  }
`

export const DynamicInfoSectionFragment = `
  ... on AnotherstepDynamicInfoSection {
    attributes {
      layoutType
      showSecondarySection
      primaryTitle
      primaryDescription
      primaryFieldLabel1
      primaryFieldValue1
      primaryFieldLabel2
      primaryFieldValue2
      primaryFieldLabel3
      primaryFieldValue3
      primaryFieldLabel4
      primaryFieldValue4
      primaryFieldLabel5
      primaryFieldValue5
      primaryFieldLabel6
      primaryFieldValue6
      primaryFieldLabel7
      primaryFieldValue7
      secondaryTitle
      secondaryDescription
      secondaryFieldLabel1
      secondaryFieldValue1
    }
  }
`;

export const VideoSectionFragment = `
    ... on AnotherstepVideoPlaceholder {
        attributes {
          layoutType
          showFilterBar
          itemsPerPage
          videoTitle
          videoDescription
          categorySlug
          tagFilter
          maxItems
        }
    }
`;

export const SplitNarrativeFragment = `
    ... on AnotherstepSplitNarrativeSection {
        attributes {
            title
            hasUnderline
            backgroundColor
            headline
            card1Icon
            card1IconColor
            card1Title
            card1Text
            card2Icon
            card2IconColor
            card2Title
            card2Text
        }
        innerBlocks {
            name
            renderedHtml
        }
    }
`;

export const BentoGridSectionFragment = `
    ... on AnotherstepBentoGridSection {
        attributes {
            title
            subtitle
            hasUnderline
            backgroundColor
            columns
        }
        innerBlocks {
            name
            clientId
            renderedHtml
            ... on AnotherstepBentoCard {
                attributes {
                    colSpan
                    cardBgStyle
                    textColor
                    icon
                    iconColor
                    title
                    description
                }
                innerBlocks {
                    name
                    clientId
                    renderedHtml
                    innerBlocks {
                        name
                        clientId
                        renderedHtml
                    }
                }
            }
        }
    }
`;

export const ContactInfoCardFragment = `
  ... on AnotherstepContactInfoCard {
    attributes {
      cardType
      title
      subtitle
      value
      href
    }
  }
`;

export const HoursCardFragment = `
  ... on AnotherstepContactHoursCard {
    attributes {
      title
      weekdayHours
      saturdayHours
      sundayHours
    }
  }
`;

export const ContactFormFragment = `
  ... on AnotherstepContactForm {
    attributes {
      title
      subtitle
      buttonText
      endpointUrl
    }
  }
`;

export const ContactGridFragment = `
  ... on AnotherstepContactGrid {
    attributes {
      layout
    }
    innerBlocks {
      name
      clientId
      renderedHtml
      ${ContactInfoCardFragment}
      ${HoursCardFragment}
      ${ContactFormFragment}
    }
  }
`;