import { PageHeroFragment } from '../components/blocks/Hero.astro'
import { SplitFeatureFragment } from '../components/blocks/SplitFeature.astro';
import { CustomGridSectionFragment } from '../components/blocks/CustomGridSection.astro';
import { CtaContactCardSectionFragment } from '../components/blocks/CtaContactCardSection.astro';
import { HomepageEthicsSectionFragment } from '../components/blocks/OneColumnCard.astro';
import { TwoColumnCardSectionFragment } from '../components/blocks/TwoColumnCardSection.astro';
import { DynamicInfoSectionFragment } from '../components/blocks/TwoColumnsBorderTop.astro';

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
        ${TwoColumnCardSectionFragment}
        ${DynamicInfoSectionFragment}
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
        return result.data;
    } catch (error) {
        console.error("WP GraphQL Fetch Error:", error);
        return null;
    }
}