# 1.1.0 (2014-08-31)

## Bug Fixes

- **jQuery compatibility**: jQuery wraps browser events in event.originalEvent

## Features

- **dnd-disable-if attribute**: allows to dynamically disable the drag and drop functionality
- **dnd-type and dnd-allowed-types**: allows to restrict an item to specifc lists depending on it's type

## Tested browsers

- Chrome 34 (Ubuntu)
- Chrome 37 (Mac)
- Chrome 37 (Win7)
- Firefox 28 (Win7)
- Firefox 31 (Ubuntu)
- Safari 7.0.6 (Mac)
- Internet Explorer 11 (IE9 & 10 in compatibility mode)

# 1.0.0 (2014-04-11)

Initial release

# Release checklist

- Bump versions
  - bower.json
  - package.json
  - JS files
- Minify (and test)
- Test different OS & browsers (npm start)
- Update README and CHANGELOG
- Merge to master
- Tag release
- Merge to gh-pages
