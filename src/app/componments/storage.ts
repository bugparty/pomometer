class Storage {
  loadState() {
    try {
      if (typeof window === 'undefined') {
        return undefined;
      }
      const serializedState = localStorage.getItem("state");
      if (serializedState === null) {
        return undefined;
      }
      return JSON.parse(serializedState);
    } catch (err) {
      console.log("error loading state from local storage", err);
      return undefined;
    }
  }
  saveState(state: unknown) {
    try {
      if (typeof window === 'undefined') {
        return;
      }
      const serializedState = JSON.stringify(state);
      localStorage.setItem("state", serializedState);
    } catch (err) {
      // ignore write errors
      console.log("error saving state from local storage", err);
    }
  }
}
export default Storage;
