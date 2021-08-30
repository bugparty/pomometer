import {mockMatchMedia} from "./setupTests";

beforeEach(() => {
    mockMatchMedia()
});
it("test jsdom windows.matchMedia mooks", () => {
    let matchMediaQuery = 'abc'
    var mql = window.matchMedia(matchMediaQuery)
    var listener = function listener(_ref) {
        var matches = _ref.matches;
        console.log('listener called')
    };
    mql.addListener(listener);
});
