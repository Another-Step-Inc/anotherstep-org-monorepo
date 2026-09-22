export const SERVICES_ARCHIVE_QUERY = `
    query GetServicesArchive {
        services(first: 100, where: { orderby: { field: MENU_ORDER, order: ASC }}) {
            nodes {
                id
                title
                slug
                content
            }
        }
    }
`

export const VALUES_ARCHIVE_QUERY = `
    query GetValuesData {
        values(first: 3) {
            nodes {
                title
                content
                cardIcon
                cardTheme
            }
        }
    }
`