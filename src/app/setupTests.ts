// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

/**
 * workaround for antd List crash under jest
 * see https://github.com/ant-design/ant-design/issues/21096
 */
const mockMatchMedia = ()=>{
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
}
export {mockMatchMedia}
/**workaround for Cannot read property 'addListener' of undefined caused by antd Lista
 *https://github.com/ant-design/ant-design/issues/21096
 * a */
