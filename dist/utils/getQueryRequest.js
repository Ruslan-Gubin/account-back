import url from 'url';
export const getQueryRequest = (urlClient) => {
    const parsedUrl = url.parse(urlClient, true);
    const pathName = parsedUrl.pathname;
    const query = parsedUrl.query;
    return { pathName, query };
};
