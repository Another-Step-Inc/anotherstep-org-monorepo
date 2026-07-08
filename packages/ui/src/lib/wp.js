const WP_URL = "http://host.docker.internal:8050/graphql";

// Reusable Editor Blocks Fragment
export const EDITOR_BLOCKS_FRAGMENT = `
    editorBlocks {
        name
        renderedHtml
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