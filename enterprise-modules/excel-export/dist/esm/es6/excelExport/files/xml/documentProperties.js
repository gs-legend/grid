const documentProperties = {
    getTemplate() {
        return {
            name: "DocumentProperties",
            properties: {
                rawMap: {
                    xmlns: "urn:schemas-microsoft-com:office:office"
                }
            },
            children: [{
                    name: "Version",
                    textNode: "12.00"
                }]
        };
    }
};
export default documentProperties;
//# sourceMappingURL=documentProperties.js.map