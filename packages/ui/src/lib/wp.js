import {
    CoreImageFragment,
    PageHeroFragment, 
    SplitFeatureFragment, 
    CustomGridSectionFragment, 
    CtaContactCardSectionFragment, 
    HomepageEthicsSectionFragment,
    JourneyForwardSectionFragment,
    PageCtaSectionFragment,
    TwoColumnCardSectionFragment,
    DynamicInfoSectionFragment,
    VideoSectionFragment,
    GallerySectionFragment,
    SplitNarrativeFragment,
    BentoGridSectionFragment,
    ImportantNoticeFragment,
    InclusionAndSupportFragment,
    UpcomingEventsFragment,
    ContactGridFragment,
    DonationGridSectionFragment
} from '../lib/fragments.js';

const WP_URL = import.meta.env.PUBLIC_WORDPRESS_API_URL;

// Reusable Editor Blocks Fragment
export const EDITOR_BLOCKS_FRAGMENT = `
    editorBlocks {
        name
        renderedHtml
        ${PageHeroFragment}
        ${HomepageEthicsSectionFragment}
        ${SplitFeatureFragment}
        ${SplitNarrativeFragment}
        ${CustomGridSectionFragment}
        ${BentoGridSectionFragment}
        ${CtaContactCardSectionFragment}
        ${PageCtaSectionFragment}
        ${JourneyForwardSectionFragment}
        ${UpcomingEventsFragment}
        ${InclusionAndSupportFragment}
        ${ImportantNoticeFragment}
        ${TwoColumnCardSectionFragment}
        ${DynamicInfoSectionFragment}
        ${VideoSectionFragment}
        ${GallerySectionFragment}
        ${ContactGridFragment}
        ${DonationGridSectionFragment}
        ${CoreImageFragment}
    }
`;

/**
 * Reusable wrapper for executing GraphQL queries against WordPress
 */
export async function wpFetch(query, variables = {}) {
    try {
        const response = await fetch(WP_URL, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({query, variables}),
        });

        const result = await response.json();

        // 🚨 ADD THIS: Log GraphQL errors returned with HTTP 200
        if (result.errors) {
            console.error("--- WP GRAPHQL ERROR ARRAY ---");
            console.error(JSON.stringify(result.errors, null, 2));
        }

        return result.data;
    } catch (error) {
        console.error("WP GraphQL Fetch Error:", error);
        return null;
    }
}

export async function getGalleryPageData() {
    const GALLERY_PAGE_QUERY = `
        query GalleryPageQuery {
            pageBy(uri: "gallery") {
                title
                featuredVideo {
                    embedLink
                    videoTitle
                    videoSubtitle
                    videoCoverImage {
                        node {
                            sourceUrl
                            altText
                        }
                    }
                }
                galleryItems {
                    galleryItems {
                        title
                        categoryTag
                        sizeVariant
                        image {
                            node {
                                sourceUrl
                                mediaItemUrl
                                altText
                            }
                        }
                    }
                }
                ${EDITOR_BLOCKS_FRAGMENT}
            }
        }
    `;
    return wpFetch(GALLERY_PAGE_QUERY);
}