const fs = require('fs');
const path = 'c:\\Users\\hp\\Documents\\Onwheels-SB\\src\\feactures\\dashboards\\admin\\pages\\compras\\productos\\Products.jsx';

let content = fs.readFileSync(path, 'utf8');

// The new modal ends with </AnimatePresence> at line 1096.
// Then the old modal starts again. We need to remove the second <AnimatePresence> block
// which contains isProductModalOpen - but KEEP the view modal.

// Strategy: find the SECOND occurrence of {isProductModalOpen && (
const firstModalIdx = content.indexOf('{isProductModalOpen && (');
const secondModalIdx = content.indexOf('{isProductModalOpen && (', firstModalIdx + 1);

if (firstModalIdx === -1) {
  console.error('No product modal found');
  process.exit(1);
}
if (secondModalIdx === -1) {
  console.log('No duplicate product modal found - nothing to do!');
  process.exit(0);
}

console.log('First modal at:', firstModalIdx);
console.log('Second modal at:', secondModalIdx);

// Find the <AnimatePresence> that wraps the second modal
// It starts just before the second modal occurrence
const animPresenceBefore = content.lastIndexOf('<AnimatePresence>', secondModalIdx);
if (animPresenceBefore === -1) {
  console.error('Cannot find AnimatePresence before second modal');
  process.exit(1);
}

// Now find where this AnimatePresence block ends. We need to find the closing </AnimatePresence>
// that corresponds to it. Walk forward counting nesting.
let depth = 0;
let i = animPresenceBefore;
let closeAnimatePresenceIdx = -1;

const openTag = '<AnimatePresence';
const closeTag = '</AnimatePresence>';

while (i < content.length) {
  const nextOpen = content.indexOf(openTag, i);
  const nextClose = content.indexOf(closeTag, i);

  if (nextOpen !== -1 && (nextClose === -1 || nextOpen < nextClose)) {
    depth++;
    i = nextOpen + openTag.length;
  } else if (nextClose !== -1) {
    depth--;
    if (depth === 0) {
      closeAnimatePresenceIdx = nextClose + closeTag.length;
      break;
    }
    i = nextClose + closeTag.length;
  } else {
    break;
  }
}

if (closeAnimatePresenceIdx === -1) {
  console.error('Cannot find closing AnimatePresence for second modal');
  process.exit(1);
}

console.log('Second modal AnimatePresence goes from', animPresenceBefore, 'to', closeAnimatePresenceIdx);

// Check what's right before animPresenceBefore - get some context
const before = content.substring(animPresenceBefore - 10, animPresenceBefore);
console.log('Chars before second AnimatePresence:', JSON.stringify(before));

// The slice to remove is from just before the whitespace+AnimatePresence start to the end of its closing tag
// Find the newline before animPresenceBefore
let removeStart = animPresenceBefore;
while (removeStart > 0 && (content[removeStart - 1] === ' ' || content[removeStart - 1] === '\n' || content[removeStart - 1] === '\r')) {
  removeStart--;
}
// Keep one newline
const removeEnd = closeAnimatePresenceIdx;

console.log('Removing from', removeStart, 'to', removeEnd);
console.log('Content to remove (first 100 chars):', JSON.stringify(content.substring(removeStart, removeStart + 100)));

const result = content.substring(0, removeStart) + '\n' + content.substring(removeEnd);
fs.writeFileSync(path, result, 'utf8');
console.log('Done! Duplicate modal removed.');
