import {mockMatchMedia} from "./setupTests";

beforeEach(() => {
    mockMatchMedia()
});
it("test jsdom windows.matchMedia mooks", () => {
    const matchMediaQuery = 'abc'
    const mql = window.matchMedia(matchMediaQuery)
    const listener = function listener(_ref) {
        const matches = _ref.matches;
        console.log('listener called')
    };
    mql.addListener(listener);
});
