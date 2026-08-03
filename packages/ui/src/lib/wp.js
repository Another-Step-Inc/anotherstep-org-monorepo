import { PageHeroFragment } from '../components/blocks/Hero.astro'
import { SplitFeatureFragment } from '../components/blocks/SplitFeature.astro';
import { CustomGridSectionFragment } from '../components/blocks/CustomGridSection.astro';
import { CtaContactCardSectionFragment } from '../components/blocks/CtaContactCardSection.astro';
import { PageCtaSectionFragment } from '../components/blocks/CtaSection.astro';
import { HomepageEthicsSectionFragment } from '../components/blocks/OneColumnCard.astro';
import { TwoColumnCardSectionFragment } from '../components/blocks/TwoColumnCardSection.astro';
import { DynamicInfoSectionFragment } from '../components/blocks/TwoColumnsBorderTop.astro';
import { VideoSectionFragment } from '../components/blocks/VideoSection.astro';
import { GallerySectionFragment } from '../components/blocks/GallerySection.astro';

const WP_URL = import.meta.env.PUBLIC_WORDPRESS_API_URL;

// Reusable Editor Blocks Fragment
export const EDITOR_BLOCKS_FRAGMENT = `
    editorBlocks {
        name
        renderedHtml
        ${PageHeroFragment}
        ${HomepageEthicsSectionFragment}
        ${SplitFeatureFragment}
        ${CustomGridSectionFragment}
        ${CtaContactCardSectionFragment}
        ${PageCtaSectionFragment}
        ${TwoColumnCardSectionFragment}
        ${DynamicInfoSectionFragment}
        ${VideoSectionFragment}
        ${GallerySectionFragment}
        ... on CoreImage {
            attributes {
                url
                alt
                caption
            }
        }
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