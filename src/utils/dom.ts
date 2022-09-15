export const getCurrSelection = (): Range => {
  return window.getSelection().getRangeAt(0);
};

export const restoreSelection = (range: Range) => {
  window.getSelection().addRange(range);
};
