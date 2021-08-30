beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: jest.fn().mockImplementation((query) => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: jest.fn(), // deprecated
            removeListener: jest.fn(), // deprecated
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            dispatchEvent: jest.fn(),
        })),
    });
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
