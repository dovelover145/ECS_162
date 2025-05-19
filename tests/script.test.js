/*
1. npm init -y (package.json)
2. npm install --save-dev jest (package-lock.json and node_modules)
3. Using mock to stimulate user for local testing
* @jest-environment jsdom
I have most of the tests dirctly inside js file already.
*/

const { getApiKey, insertArticleContent, submitComment_Uni, listComment } = require("../static/js/script");

describe("getApiKey()", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test("returns API key on success", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ apiKey: "1234567890" })
    });

    const key = await getApiKey();
    expect(key).toBe("1234567890");
  });

  test("throws error on bad response", async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      json: async () => ({})
    });

    await expect(getApiKey()).rejects.toThrow("Couldn't retrieve the API key");
  });

  test("throws error on bad JSON", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => { throw new Error("invalid JSON"); }
    });

    await expect(getApiKey()).rejects.toThrow("Couldn't translate the received API key");
  });
});
  test("renders comment and Delete button for admin", () => {
    //this function has trouble running since login is through dex and I can not mock dex user or I have to change a lot in my script so
    //I just leave there in case.
  window.currentUser = { name: "admin" };

  const comment = {
    _id: "123",
    user: "tester",
    comment: "hello world",
    children: []
  };

  document.body.innerHTML = `
    <ul id="comments"></ul>
    <div id="sidebar_make_comments" data-article-url="test-url"></div>
  `;

  const ul = document.getElementById("comments");
  listComment(comment, ul);

  expect(ul.innerHTML).toContain("hello world");
  expect(ul.querySelector("button.delete-button")).not.toBeNull();
});

