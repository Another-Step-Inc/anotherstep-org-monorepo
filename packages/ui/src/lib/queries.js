export const SERVICES_ARCHIVE_QUERY = `
    query GetServicesArchive {
        services(first: 100, where: { orderby: { field: MENU_ORDER, order: ASC }}) {
            nodes {
                id
                title
                content
            }
        }
    }
`