// <input-persist> observes all contained input elements with a [data-persist-key] attribute.
// When the user changes the value of an input element, it saves that value to local storage.
// The [data-persist-key] attribute specifies the storage key.
// When an input element first loads - or is placed - inside <input-parsist>, its value is set to the stored value.
//
// <input-persist> supports the following elements:
// - <input type="checkbox">
// - <input type="radio">
customElements.define(
  "input-persist",
  class extends HTMLElement {
    connectedCallback() {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.removedNodes.forEach((node) => {
            node.removeEventListener("input", this);
          });
          mutation.addedNodes.forEach((node) => {
            if (node.nodeName == "INPUT") {
              node.addEventListener("input", this);
              const persistKey = node.dataset.persistKey;
              if (!persistKey) return;

              const savedValue = localStorage.getItem(persistKey);
              if (savedValue) {
                switch (node.type) {
                  case "checkbox":
                  case "radio":
                    node.checked = savedValue === "checked";
                    break;
                  default:
                    console.warn(
                      `input-persist: cannot persist unsupported element <input type=${node.type}>.`,
                      node
                    );
                    break;
                }
              }
            }
          });
        });
      });
      observer.observe(this, { childList: true, subtree: true });
    }

    handleEvent(event) {
      const persistKey = event.target.dataset.persistKey;
      if (!persistKey) return;

      switch (event.target.type) {
        case "checkbox":
          localStorage.setItem(
            persistKey,
            event.target.checked ? "checked" : "unchecked"
          );
          break;
        case "radio":
          const radioName = event.target.getAttribute("name");
          this.querySelectorAll(`input[name=${radioName}]`).forEach((radio) => {
            if (radio.dataset.persistKey) {
              localStorage.setItem(
                radio.dataset.persistKey,
                radio === event.target ? "checked" : "unchecked"
              );
            }
          });
          break;
        default:
          console.warn(
            `input-persist: cannot persist unsupported element <input type=${event.target.type}>.`,
            event.target
          );
          break;
      }
    }
  }
);