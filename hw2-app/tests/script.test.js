/*
1. npm init -y (package.json)
2. npm install --save-dev jest (package-lock.json and node_modules)
*/

const {getApiKey, insertArticleContent} = require("../static/js/script.js")

describe("Testing getApiKey()", () => {
    beforeEach(() => {
        global.fetch = jest.fn();
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    test("Successful retrieval of the API key", () => {
        global.fetch.mockImplementation(async () => {
            return ({ok: true, json: async () => ({apiKey: "1234567890"})});
        });
        expect(getApiKey()).resolves.toEqual("1234567890");
    });
    
    test("Couldn't retrieve the API key", () => {
        global.fetch.mockImplementation(async () => {
            return ({ok: false, json: async () => ({apiKey: "1234567890"})});
        });
        expect(getApiKey()).rejects.toThrow("Couldn't retrieve the API key"); /* Use toThrow() for synchronous functions and rejects.toThrow() for asynchronous functions * */
    });

    test("Couldn't translate the received API key", () => {
        global.fetch.mockImplementation(async () => {
            return ({ok: true}); /* No json field */
        });
        expect(getApiKey()).rejects.toThrow("Couldn't translate the received API key"); /* Use toThrow() for synchronous functions and rejects.toThrow() for asynchronous functions * */
    });
});

describe("Testing insertArticleContent()", () => {
    beforeEach(() => {
        global.fetch = jest.fn();
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    test("Couldn't retrieve the API key", () => {
        global.fetch.mockImplementation(async (url) => {
            if (url == "/api/key") {
                return {ok: false, json: async () => ({apiKey: "1234567890"})};
            } else {
                return ({ok: false, json: async () => ({})});
            }
        });
        expect(insertArticleContent()).rejects.toThrow("Couldn't retrieve the API key");
    });

    test("Couldn't translate the received API key", () => {
        global.fetch.mockImplementation(async (url) => {
            if (url == "/api/key") {
                return ({ok: true});
            } else {
                return ({ok: false, json: async () => ({})});
            }
        });
        expect(insertArticleContent()).rejects.toThrow("Couldn't translate the received API key");
    });
    
    test("Couldn't retrieve the article content", () => {
        global.fetch.mockImplementation(async (url) => {
            if (url == "/api/key") {
                return {ok: true, json: async () => ({apiKey: "1234567890"})};
            } else {
                return ({ok: false, json: async () => ({})});
            }
        });
        expect(insertArticleContent()).rejects.toThrow("Couldn't retrieve the article content");
    });

    test("Couldn't translate the article content", () => {
        global.fetch.mockImplementation(async (url) => {
            if (url == "/api/key") {
                return {ok: true, json: async () => ({apiKey: "1234567890"})};
            } else {
                return ({ok: true});
            }
        });
        expect(insertArticleContent()).rejects.toThrow("Couldn't translate the article content");
    });
});