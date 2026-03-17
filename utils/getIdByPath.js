export const getIdByPath = (pathname) => {
	return parseInt(pathname.split("/")[2], 10);
};
