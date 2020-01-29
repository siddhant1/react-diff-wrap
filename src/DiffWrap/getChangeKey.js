export function getChangeKey(change, file) {
  if (!change) throw new Error("change is not provided");
  var isNormal = change.isNormal,
    isInsert = change.isInsert,
    lineNumber = change.lineNumber,
    oldLineNumber = change.oldLineNumber;
  return isNormal + "+" + file
    ? "N" + oldLineNumber
    : (isInsert ? "I" : "D") + lineNumber + "+" + file;
}
