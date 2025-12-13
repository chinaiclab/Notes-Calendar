# Notes-Calendar

An Obsidian plugin that displays creation/modification dates, sorts notes by date, and provides an interactive calendar view for browsing your notes.

## Features

- **Date Display**: Shows creation and modification dates in the file explorer
- **Date Sorting**: Allows sorting notes by modification date
- **Calendar View**: Interactive calendar in the right sidebar for browsing notes by modification date
- **Multiple Views**: Support for both year view and month view
- **File Statistics**: Displays file and note counts for folders
- **Language Support**: English and Chinese interface
- **Jump Navigation**: Click on files to jump to specific dates in the calendar

## Installation

1. Download the latest release from the [Releases](https://github.com/chinaiclab/Notes-Calendar/releases) page
2. Extract the contents to your Obsidian vault's `plugins` directory
3. Enable the plugin in Obsidian Settings → Community Plugins

### From Obsidian Community Plugins

1. Go to Settings → Community Plugins
2. Browse for "Notes-Calendar"
3. Click Install and then Enable

## Usage

### Calendar View

- Open the calendar view from the right sidebar (Ribbon icon)
- Switch between year view and month view using the view switcher
- Click on files in the timeline to open them
- Navigate between months/years using the arrow buttons
- Click on files in the file explorer to jump to their dates in the calendar

### Settings

- **Show Creation Date**: Display file creation dates in the file explorer
- **Show Modification Date**: Display file modification dates in the file explorer
- **Date Format**: Customize the display format for dates
- **Calendar View**: Enable/disable the calendar sidebar view
- **First Day of Week**: Set the first day of the week (Sunday/Monday)
- **Show File Count**: Display file and note counts in folders
- **Language**: Choose between English and Chinese interface

## Screenshots

![Calendar View](https://github.com/chinaiclab/Notes-Calendar/raw/main/screenshots/calendar-view.png)
*Interactive calendar view with year and month modes*

![File Explorer](https://github.com/chinaiclab/Notes-Calendar/raw/main/screenshots/file-explorer.png)
*File explorer with date display and file counts*

## Development

### Building

```bash
# Install dependencies
npm install

# Development mode with hot reload
npm run dev

# Build for production
npm run build
```

### Versioning

```bash
# Update version (updates both manifest.json and versions.json)
npm run version
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Support

If you encounter any issues or have suggestions, please:

- [Open an issue](https://github.com/chinaiclab/Notes-Calendar/issues) on GitHub
- Check the [Wiki](https://github.com/chinaiclab/Notes-Calendar/wiki) for documentation

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Thanks to the Obsidian team for creating such an amazing note-taking application
- Thanks to all contributors who have helped improve this plugin

## Author

**Chinaiclab** - [GitHub](https://github.com/chinaiclab)

---

**Made with ❤️ for the Obsidian community**