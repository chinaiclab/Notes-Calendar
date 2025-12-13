/*
 * Notes-Calendar
 * Copyright (c) 2024 Chinaiclab (https://github.com/chinaiclab)
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { App, Plugin, PluginSettingTab, Setting, TFile, Notice, WorkspaceLeaf, ItemView, Modal } from 'obsidian';

interface NoteDatesSettings {
	showCreationDate: boolean;
	showModificationDate: boolean;
	dateFormat: string;
	enableCalendarView: boolean;
	calendarFirstDayOfWeek: number;
		showFileCount: boolean;
	calendarViewType: 'month' | 'year';
	sortOrder: 'desc' | 'asc';
	showSubdirectoryStats: boolean;
	language: 'en' | 'zh';
}

// Localization helper function
function getLocalizedText(key: string, language: 'en' | 'zh'): string {
	const texts: { [key: string]: { [lang: string]: string } } = {
		// Months
		'january': { en: 'January', zh: '一月' },
		'february': { en: 'February', zh: '二月' },
		'march': { en: 'March', zh: '三月' },
		'april': { en: 'April', zh: '四月' },
		'may': { en: 'May', zh: '五月' },
		'june': { en: 'June', zh: '六月' },
		'july': { en: 'July', zh: '七月' },
		'august': { en: 'August', zh: '八月' },
		'september': { en: 'September', zh: '九月' },
		'october': { en: 'October', zh: '十月' },
		'november': { en: 'November', zh: '十一月' },
		'december': { en: 'December', zh: '十二月' },

		// File counts
		'files': { en: 'files', zh: '文件' },
		'notes': { en: 'notes', zh: '笔记' },
		'filesAndNotes': { en: 'files, notes', zh: '文件，笔记' },
		'totalFiles': { en: 'Total', zh: '总计' },
		'filesTotal': { en: 'files', zh: '个文件' },
		'notesTotal': { en: 'notes', zh: '个笔记' },
		'includingSubdirectories': { en: 'including subdirectories', zh: '（包含子目录）' },

		// Weekdays
		'sunday': { en: 'Sun', zh: '周日' },
		'monday': { en: 'Mon', zh: '周一' },
		'tuesday': { en: 'Tue', zh: '周二' },
		'wednesday': { en: 'Wed', zh: '周三' },
		'thursday': { en: 'Thu', zh: '周四' },
		'friday': { en: 'Fri', zh: '周五' },
		'saturday': { en: 'Sat', zh: '周六' },

		// UI Text
		'notesCalendar': { en: 'Notes Calendar', zh: '笔记日历' },
		'yearView': { en: 'Year View', zh: '年视图' },
		'monthView': { en: 'Month View', zh: '月视图' },
		'locatedToFile': { en: 'Located to file', zh: '已定位到文件' },
		'jumpedToMonthView': { en: 'Jumped to', zh: '已跳转到' },
		'monthViewAbbr': { en: 'month view', zh: '月视图' },
		'switchView': { en: 'Switch view', zh: '切换视图' },
		'currentView': { en: 'Current', zh: '当前' },
		'yearToMonth': { en: '⊞', zh: '⊞' },
		'monthToYear': { en: '⊟', zh: '⊟' },
		'switchViewTooltip': { en: 'Click to switch view (Current: {current})', zh: '点击切换视图 (当前: {current})' },
		'newNote': { en: 'New Note', zh: '新建笔记' },
		'newNoteTooltip': { en: 'Create new note with current timestamp', zh: '使用当前日期时间创建新笔记' },
		'timeDesc': { en: 'Time Desc', zh: '时间降序' },
		'timeAsc': { en: 'Time Asc', zh: '时间升序' },
		'timeDescTooltip': { en: 'Time Desc (Newest first)', zh: '时间降序 (最新在前)' },
		'timeAscTooltip': { en: 'Time Asc (Oldest first)', zh: '时间升序 (最旧在前)' },
		'newNoteCreated': { en: 'New note created:', zh: '新建笔记:' },
		'createNoteFailed': { en: 'Failed to create note:', zh: '创建笔记失败:' },
		'noNotesThisWeek': { en: 'No notes modified this week', zh: '没有笔记在本周修改' },
		'yearNoNotes': { en: 'No notes in', zh: '没有笔记在' }
	};

	return texts[key]?.[language] || key;
}

// Get localized month names
function getMonthNames(language: 'en' | 'zh'): string[] {
	return [
		getLocalizedText('january', language),
		getLocalizedText('february', language),
		getLocalizedText('march', language),
		getLocalizedText('april', language),
		getLocalizedText('may', language),
		getLocalizedText('june', language),
		getLocalizedText('july', language),
		getLocalizedText('august', language),
		getLocalizedText('september', language),
		getLocalizedText('october', language),
		getLocalizedText('november', language),
		getLocalizedText('december', language)
	];
}

// Get localized weekday names
function getWeekdayNames(language: 'en' | 'zh'): string[] {
	return [
		getLocalizedText('sunday', language),
		getLocalizedText('monday', language),
		getLocalizedText('tuesday', language),
		getLocalizedText('wednesday', language),
		getLocalizedText('thursday', language),
		getLocalizedText('friday', language),
		getLocalizedText('saturday', language)
	];
}

// Format file count text with localization
function formatFileCountText(totalFiles: number, totalNotes: number, language: 'en' | 'zh'): string {
	// Fixed to always use English format
	const filesText = 'files';
	const notesText = 'notes';

	return `(${totalFiles} ${filesText}, ${totalNotes} ${notesText})`;
}

// Format file count tooltip with localization
function formatFileCountTooltip(totalFiles: number, totalNotes: number, language: 'en' | 'zh'): string {
	// Fixed to always use English format
	const totalText = 'Total';
	const filesText = 'files';
	const notesText = 'notes';
	const includingText = 'including subdirectories';

	return `${totalText} ${totalFiles} ${filesText}, ${totalNotes} ${notesText} ${includingText}`;
}

const DEFAULT_SETTINGS: NoteDatesSettings = {
	showCreationDate: true,
	showModificationDate: true,
	dateFormat: 'YYYY-MM-DD',
	enableCalendarView: true,
	calendarFirstDayOfWeek: 0, // 0 = Sunday, 1 = Monday
	showFileCount: true,
	calendarViewType: 'year',
	sortOrder: 'desc', // Default to newest first
	showSubdirectoryStats: true,
	language: 'zh' // Default to Chinese
}

const CALENDAR_VIEW_TYPE = "notes-calendar-view";

class NotesDatesPlugin extends Plugin {
	settings: NoteDatesSettings;
	private lastLanguage: 'en' | 'zh' = 'zh'; // Track last language to detect changes

	async onload() {
		await this.loadSettings();

		// Add CSS styles for consistent button sizes
		this.addCalendarStyles();

		// Add file explorer hooks for date display
		this.registerEvent(
			this.app.vault.on('create', (file) => {
				if (file instanceof TFile) {
					this.updateFileDisplay(file);
				}
			})
		);

		this.registerEvent(
			this.app.vault.on('modify', (file) => {
				if (file instanceof TFile) {
					this.updateFileDisplay(file);
				}
			})
		);

		// Add command to toggle sorting
		this.addCommand({
			id: 'toggle-sort-by-modified',
			name: 'Toggle Sort by Modification Date',
			callback: () => {
				this.toggleSortByModified();
			}
		});

		// Add command to open calendar view
		this.addCommand({
			id: 'open-calendar-view',
			name: 'Open Calendar View',
			callback: () => {
				this.activateCalendarView();
			}
		});

		// Register calendar view
		this.registerView(
			CALENDAR_VIEW_TYPE,
			(leaf) => new CalendarView(leaf, this)
		);

		// Add ribbon icon for calendar
		this.addRibbonIcon('calendar-days', 'Open Notes Calendar', () => {
			this.activateCalendarView();
		});

		// Initialize file display
		this.updateAllFilesDisplay();

		// Add file click listeners for calendar jumping and watch for DOM changes
		this.setupFileClickListeners();

		// Add settings tab
		this.addSettingTab(new NotesDatesSettingTab(this.app, this));
	}

	addCalendarStyles() {
		// Create style element for consistent button sizes
		const style = document.createElement('style');
		style.textContent = `
			.calendar-controls button,
			.view-switcher-btn,
			.new-note-button,
			.sort-button {
				min-width: 28px;
				height: 28px;
				padding: 2px 6px;
				font-size: 14px;
				border: 1px solid var(--background-modifier-border);
				border-radius: 4px;
				background-color: var(--interactive-normal);
				color: var(--text-normal);
				cursor: pointer;
				display: inline-flex;
				align-items: center;
				justify-content: flex-start;
				transition: background-color 0.2s ease;
			}

			.calendar-controls button:hover,
			.view-switcher-btn:hover,
			.new-note-button:hover,
			.sort-button:hover {
				background-color: var(--interactive-hover);
			}

			.calendar-controls button:active,
			.view-switcher-btn:active,
			.new-note-button:active,
			.sort-button:active {
				background-color: var(--interactive-active);
			}

			/* Ensure consistent spacing and left alignment */
			.calendar-controls {
				display: flex;
				align-items: center;
				gap: 4px;
				margin-bottom: 12px;
				justify-content: flex-start;
			}

			.view-selector-single {
				/* Removed margin-left: auto to align all buttons to the left */
			}

			/* Make icons even smaller */
			.calendar-controls button,
			.view-switcher-btn,
			.new-note-button {
				font-size: 14px;
				font-weight: normal;
				padding: 2px 6px;
				min-width: 28px;
				height: 28px;
			}

			/* Special sizing for text buttons */
			.sort-button {
				font-size: 10px;
				padding: 2px 4px;
				min-width: 28px;
				height: 28px;
			}

			/* File highlighting styles */
			.file-scroll-highlight {
				background-color: var(--background-modifier-hover) !important;
				border-left: 3px solid var(--interactive-accent) !important;
				padding-left: 8px !important;
				margin-left: -3px !important;
				transition: all 0.3s ease;
			}

			.file-click-highlight {
				background-color: var(--background-modifier-hover) !important;
				border-left: 3px solid var(--interactive-accent-hue) !important;
				padding-left: 8px !important;
				margin-left: -3px !important;
				box-shadow: 0 0 8px rgba(var(--interactive-accent-rgb), 0.3) !important;
				transition: all 0.2s ease;
			}

			.year-view-file-highlight {
				background-color: var(--interactive-accent) !important;
				color: var(--text-on-accent) !important;
				border-radius: 4px !important;
				box-shadow: 0 0 10px rgba(var(--interactive-accent-rgb), 0.5) !important;
				animation: year-view-highlight-pulse 2s ease-in-out !important;
			}

			@keyframes year-view-highlight-pulse {
				0% { transform: scale(1); }
				50% { transform: scale(1.02); }
				100% { transform: scale(1); }
			}

			/* Year view layout styles */
			.year-view-timeline-container {
				display: flex;
				flex-direction: column;
				height: 100%;
				max-height: 100%;
			}

			.year-month-timeline {
				position: sticky;
				top: 0;
				z-index: 10;
				background-color: var(--background-primary);
				border-bottom: 1px solid var(--background-modifier-border);
				padding: 8px 0;
				flex-shrink: 0;
			}

			.year-month-timeline-container {
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding: 0 12px;
				gap: 4px;
			}

			.year-month-timeline-item {
				display: flex;
				flex-direction: column;
				align-items: center;
				padding: 6px 8px;
				border-radius: 6px;
				cursor: pointer;
				transition: all 0.2s ease;
				min-width: 50px;
				background-color: var(--background-secondary);
				border: 1px solid var(--background-modifier-border);
			}

			.year-month-timeline-item:hover {
				background-color: var(--background-modifier-hover);
				transform: translateY(-1px);
			}

			.year-month-timeline-item.active {
				background-color: var(--interactive-accent);
				color: var(--text-on-accent);
				border-color: var(--interactive-accent);
			}

			.year-month-timeline-item.has-notes {
				border-color: var(--interactive-accent);
				font-weight: 500;
			}

			.year-month-timeline-month {
				font-size: 12px;
				font-weight: 500;
				white-space: nowrap;
			}

			.year-month-timeline-count {
				font-size: 10px;
				opacity: 0.7;
				margin-top: 2px;
			}

			/* Timeline should be the only scrollable area */
			.year-view-timeline-container .timeline {
				flex: 1;
				overflow-y: auto;
				padding: 12px 0;
				max-height: calc(100vh - 200px); /* Adjust based on header and month timeline height */
			}

			/* Ensure calendar container has proper height constraints */
			.calendar-container {
				height: 100%;
				display: flex;
				flex-direction: column;
			}

			/* Fix calendar view to use full height */
			.calendar-view {
				height: 100%;
				display: flex;
				flex-direction: column;
			}

			/* Ensure the content area is properly constrained */
			.calendar-content {
				flex: 1;
				overflow: hidden;
				display: flex;
				flex-direction: column;
			}

			.year-month-header {
				margin-top: 20px;
				margin-bottom: 12px;
				padding: 0 12px;
				border-left: 3px solid var(--interactive-accent);
				padding-left: 12px;
				background-color: var(--background-secondary);
				border-radius: 0 4px 4px 0;
			}

			.year-month-header h3 {
				margin: 0;
				font-size: 14px;
				font-weight: 600;
				color: var(--text-normal);
			}
		`;
		document.head.appendChild(style);
	}

	onunload() {
		// Clean up file display when plugin is unloaded
		this.cleanupFileDisplay();
	}

	cleanupFileDisplay() {
		// Remove date displays from file explorer
		const fileTitles = document.querySelectorAll('.nav-file-title');
		fileTitles.forEach((fileTitle: Element) => {
			const fileTitleEl = fileTitle as HTMLElement;

			// Remove date display elements
			const dateDisplays = fileTitleEl.querySelectorAll('.date-display');
			dateDisplays.forEach(el => el.remove());
		});

		// Remove file count from folders
		const folderTitles = document.querySelectorAll('.nav-folder-title');
		folderTitles.forEach((folderTitle: Element) => {
			const folderTitleEl = folderTitle as HTMLElement;
			const fileCounts = folderTitleEl.querySelectorAll('.file-count');
			fileCounts.forEach(el => el.remove());
		});

		// Remove calendar click listeners
		const fileTitlesWithListeners = document.querySelectorAll('.nav-file-title[data-calendar-listener]');
		fileTitlesWithListeners.forEach((fileTitle: Element) => {
			const fileTitleEl = fileTitle as HTMLElement;
			fileTitleEl.removeAttribute('data-calendar-listener');

			// Clone and replace to remove all event listeners
			const clone = fileTitleEl.cloneNode(true);
			fileTitleEl.parentNode?.replaceChild(clone, fileTitleEl);
		});
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
		this.lastLanguage = this.settings.language; // Initialize language tracking
	}

	async saveSettings(skipFileDisplayUpdate: boolean = false) {
		await this.saveData(this.settings);

		// Check if language changed and update file display accordingly
		const languageChanged = this.lastLanguage !== this.settings.language;
		if (languageChanged) {
			this.lastLanguage = this.settings.language; // Update tracking
		}

		// Only update file display if language changed or not explicitly skipped
		if (!skipFileDisplayUpdate && languageChanged) {
			this.updateAllFilesDisplay();
		}
	}

	updateFileDisplay(_file: TFile) {
		// This will be called when files are created or modified
		// The actual display update will be handled by CSS and file explorer modifications
		this.updateAllFilesDisplay();
	}

	updateAllFilesDisplay() {
		// 使用更可靠的方法更新所有文件显示
		this.updateFileExplorerDates();
	}

	updateFileExplorerDates() {
		// Update immediately without delay when called from applyCurrentLanguageImmediately
		const fileTitles = document.querySelectorAll('.nav-file-title');
		const folderTitles = document.querySelectorAll('.nav-folder-title');

		// 处理文件
		fileTitles.forEach((fileTitleElement: Element) => {
			const fileTitle = fileTitleElement as HTMLElement;
			const filePath = fileTitle.getAttribute('data-path');

			if (filePath) {
				const file = this.app.vault.getAbstractFileByPath(filePath);
				if (file && file instanceof TFile && file.extension === 'md') {
					this.addDateDisplayToFileTitle(fileTitle, file);
				}
			}
		});

		// 处理文件夹
		if (this.settings.showFileCount) {
			folderTitles.forEach((folderTitleElement: Element) => {
				const folderTitle = folderTitleElement as HTMLElement;
				const folderPath = this.getFolderPathFromTitle(folderTitle);

				if (folderPath) {
					this.addFileCountToFolder(folderTitle, folderPath);
				}
			});
		}
	}

	updateFileExplorerDatesDelayed() {
		// Delayed version for use in cases where we need to wait for DOM updates
		setTimeout(() => {
			this.updateFileExplorerDates();
		}, 100);
	}

	applyCurrentLanguageImmediately() {
		// Force update all file displays with current language settings
		// This ensures language consistency after any operation
		this.updateFileExplorerDates();
	}

	ensureLanguageConsistency() {
		// Check if current language settings are properly applied
		const currentLanguage = this.settings.language;
		const fileDateElements = document.querySelectorAll('.date-display');
		const fileCountElements = document.querySelectorAll('.file-count');

		// Quick check for obvious language mismatches
		let needsUpdate = false;

		// Check file counts for language inconsistencies
		fileCountElements.forEach((element: Element) => {
			const text = element.textContent || '';
			// If English is set but we see Chinese characters, or vice versa
			if (currentLanguage === 'en' && (text.includes('文件') || text.includes('笔记'))) {
				needsUpdate = true;
			} else if (currentLanguage === 'zh' && (text.includes('files') || text.includes('notes'))) {
				needsUpdate = true;
			}
		});

		// Update only if we detected inconsistencies
		if (needsUpdate) {
			console.log('Language inconsistency detected, updating file displays');
			this.updateFileExplorerDates();
		}
	}

	addDateDisplayToFileTitle(fileTitle: HTMLElement, file: TFile) {
		// 移除现有的日期显示
		const existingDate = fileTitle.querySelector('.date-display');
		if (existingDate) {
			existingDate.remove();
		}

		if (this.settings.showModificationDate || this.settings.showCreationDate) {
			const date = this.settings.showModificationDate ? file.stat.mtime : file.stat.ctime;
			const dateObj = new Date(date);
			const dateStr = this.formatCompactDate(dateObj);

			// 在文件标题的右侧插入日期显示
			const dateDisplay = document.createElement('span');
			dateDisplay.className = 'date-display';
			dateDisplay.textContent = dateStr;

			// 插入到文件标题内容的末尾
			const fileTitleContent = fileTitle.querySelector('.nav-file-title-content');
			if (fileTitleContent) {
				fileTitleContent.appendChild(dateDisplay);
			} else {
				// 备用方案：直接插入到文件标题末尾
				fileTitle.appendChild(dateDisplay);
			}
		}
	}

	
	
	formatCompactDate(date: Date): string {
		try {
			const now = new Date();
			const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
			const fileDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
			// Fixed to always use English format
			const localeString = 'en-US';

			// If it's today, show time only (24-hour format)
			if (fileDate.getTime() === today.getTime()) {
				return date.toLocaleTimeString(localeString, {
					hour: '2-digit',
					minute: '2-digit',
					hour12: false
				});
			}

			// If it's yesterday, show "Yesterday" + time
			const yesterday = new Date(today);
			yesterday.setDate(yesterday.getDate() - 1);
			if (fileDate.getTime() === yesterday.getTime()) {
				return 'Yesterday ' + date.toLocaleTimeString(localeString, {
					hour: '2-digit',
					minute: '2-digit',
					hour12: false
				});
			}

			// Otherwise show month and day
			return date.toLocaleDateString(localeString, {
				month: 'short',
				day: 'numeric'
			});
		} catch (error) {
			return '';
		}
	}

	getFolderPathFromTitle(folderTitle: HTMLElement): string | null {
		// 方法1：尝试从data-path属性直接获取
		let dataPath = folderTitle.getAttribute('data-path');
		if (dataPath) {
			return dataPath;
		}

		// 方法2：尝试从文件夹标题文本获取
		const folderText = folderTitle.querySelector('.nav-folder-title-content')?.textContent;
		if (folderText) {
			// 移除文件计数部分，只保留文件夹名称
			const cleanFolderName = folderText.replace(/\s*\([^)]*\)\s*$/, '').trim();
			if (cleanFolderName) {
				return cleanFolderName;
			}
		}

		// 方法3：从子元素推断文件夹路径
		const folderContent = folderTitle.parentElement?.querySelector('.nav-folder-children');
		if (folderContent) {
			// 从第一个文件的路径推断文件夹路径
			const firstFile = folderContent.querySelector('.nav-file-title');
			if (firstFile) {
				const filePath = firstFile.getAttribute('data-path');
				if (filePath) {
					// 获取父文件夹路径
					const parts = filePath.split('/');
					return parts.slice(0, -1).join('/');
				}
			}
		}

		// 方法4：尝试从aria-label获取
		const ariaLabel = folderTitle.getAttribute('aria-label');
		if (ariaLabel) {
			// 移除"Folder: "前缀（如果存在）
			return ariaLabel.replace(/^Folder:\s*/, '');
		}

		// 方法5：从父元素的data-list-item获取
		const parentItem = folderTitle.closest('[data-list-item]');
		if (parentItem) {
			const listItemPath = parentItem.getAttribute('data-list-item');
			if (listItemPath) {
				return listItemPath;
			}
		}

		// 方法6：通过遍历DOM树构建路径
		const pathParts: string[] = [];
		let currentElement: Element | null = folderTitle;

		while (currentElement && !currentElement.classList.contains('nav-files-container')) {
			const folderTitleContent = currentElement.querySelector('.nav-folder-title-content');
			if (folderTitleContent) {
				const text = folderTitleContent.textContent?.trim();
				if (text && !pathParts.includes(text)) {
					pathParts.unshift(text);
				}
			}
			currentElement = currentElement.parentElement?.closest('.nav-folder');
		}

		if (pathParts.length > 0) {
			return pathParts.join('/');
		}

		return null;
	}

	addFileCountToFolder(folderTitle: HTMLElement, folderPath: string) {
		// 移除现有的文件数量显示
		const existingCount = folderTitle.querySelector('.file-count');
		if (existingCount) {
			existingCount.remove();
		}

		try {
			const stats = this.countFilesInFolder(folderPath);

			if (stats.totalFiles > 0) {
				const countDisplay = document.createElement('span');
				countDisplay.className = 'file-count';
				countDisplay.textContent = formatFileCountText(stats.totalFiles, stats.totalNotes, this.settings.language);
				countDisplay.title = formatFileCountTooltip(stats.totalFiles, stats.totalNotes, this.settings.language);

				// 添加到文件夹标题内容的末尾
				const folderTitleContent = folderTitle.querySelector('.nav-folder-title-content') || folderTitle;
				folderTitleContent.appendChild(countDisplay);
			}
		} catch (error) {
			// 静默处理错误，避免影响其他功能
			console.debug('Error counting files in folder:', folderPath, error);
		}
	}

	countFilesInFolder(folderPath: string) {
		try {
			const folder = this.app.vault.getAbstractFileByPath(folderPath);
			if (!folder || !('children' in folder)) {
				return { totalFiles: 0, totalNotes: 0, subfolderStats: [] };
			}

			const stats = { totalFiles: 0, totalNotes: 0, subfolderStats: [] as Array<{ name: string; path: string; files: number; notes: number }> };
			const children = folder.children as any[];

			children.forEach(child => {
				if (child instanceof TFile) {
					stats.totalFiles++;
					if (child.extension === 'md') {
						stats.totalNotes++;
					}
				} else if (child && 'children' in child) {
					// 处理子目录
					const subStats = this.countFilesInFolder(child.path);
					stats.totalFiles += subStats.totalFiles;
					stats.totalNotes += subStats.totalNotes;
					stats.subfolderStats.push({
						name: child.name,
						path: child.path,
						files: subStats.totalFiles,
						notes: subStats.totalNotes
					});
				}
			});

			return stats;
		} catch (error) {
			console.debug('Error counting files in folder:', folderPath, error);
			return { totalFiles: 0, totalNotes: 0, subfolderStats: [] };
		}
	}

	async toggleSortByModified() {
		const files = this.app.vault.getMarkdownFiles();

		// Sort by modification date (most recent first)
		const sortedFiles = files.sort((a, b) => {
			return b.stat.mtime - a.stat.mtime;
		});

		// Sort notification removed for cleaner user experience

		// You might want to implement a custom sort view here
		// For now, we'll just show a notification
	}

	async activateCalendarView() {
		const { workspace } = this.app;

		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(CALENDAR_VIEW_TYPE);

		if (leaves.length > 0) {
			// A leaf with our view already exists, use it
			leaf = leaves[0];
		} else {
			// Create a new leaf in the right sidebar
			leaf = workspace.getRightLeaf(false);
			await leaf?.setViewState({ type: CALENDAR_VIEW_TYPE, active: true });
		}

		// Reveal the leaf in case it is in a collapsed panel
		if (leaf) {
			workspace.revealLeaf(leaf);
		}
	}

	setupFileClickListeners() {
		// Initial setup
		this.addFileClickListeners();

		// Watch for DOM changes (file explorer updates)
		const observer = new MutationObserver((mutations) => {
			mutations.forEach((mutation) => {
				if (mutation.type === 'childList') {
					// Check if any .nav-file-title or .nav-folder-title elements were added
					const addedNodes = Array.from(mutation.addedNodes);
					if (addedNodes.some(node =>
						node.nodeType === Node.ELEMENT_NODE &&
						((node as Element).querySelector('.nav-file-title') ||
						 (node as Element).querySelector('.nav-folder-title') ||
						 (node as Element).classList.contains('nav-file-title') ||
						 (node as Element).classList.contains('nav-folder-title'))
					)) {
						setTimeout(() => {
							this.addFileClickListeners();
							this.applyCurrentLanguageImmediately();
						}, 50); // Faster response with immediate language application
					}
				}
			});
		});

		// Start observing the file explorer
		const fileExplorer = document.querySelector('.nav-files-container');
		if (fileExplorer) {
			observer.observe(fileExplorer, {
				childList: true,
				subtree: true
			});
		}

		// Smart periodic sync to ensure language consistency
		// This runs less frequently and only updates when needed
		setInterval(() => {
			this.ensureLanguageConsistency();
		}, 5000); // Check every 5 seconds instead of 2 seconds
	}

	addFileClickListeners() {
		// Add click listeners to existing file titles
		const fileTitles = document.querySelectorAll('.nav-file-title');

		fileTitles.forEach((fileTitle: Element) => {
			const fileTitleEl = fileTitle as HTMLElement;
			const filePath = fileTitleEl.getAttribute('data-path');
			if (!filePath) return;

			// Skip if already has our listener
			if (fileTitleEl.hasAttribute('data-calendar-listener')) return;

			const file = this.app.vault.getAbstractFileByPath(filePath);
			if (!file || !(file instanceof TFile) || file.extension !== 'md') return;

			// Mark that we've added a listener
			fileTitleEl.setAttribute('data-calendar-listener', 'true');

			// Add click listener for file interaction based on current calendar view
			const clickHandler = (e: MouseEvent) => {
				e.preventDefault();
				e.stopPropagation();
				console.log('File click triggered for file:', file.path); // Debug log

				// Check current calendar view type using plugin settings directly
				if (this.settings.calendarViewType === 'year') {
					// In year view: scroll to the file within the year view's month timeline
					this.scrollToFileInYearView(file);
					console.log('Year view: scrolling to file in year timeline');
					return;
				}

				// In month view or other views: jump to file's date
				this.jumpCalendarToFileDate(file);
			};

			fileTitleEl.addEventListener('click', clickHandler);


			// Store handler reference for potential cleanup
			(fileTitleEl as any)._calendarClickHandler = clickHandler;
		});

		// Also update folder file counts if enabled
		if (this.settings.showFileCount) {
			const folderTitles = document.querySelectorAll('.nav-folder-title');
			folderTitles.forEach((folderTitle: Element) => {
				const folderTitleEl = folderTitle as HTMLElement;

				// Check if this folder already has file count displayed
				const existingCount = folderTitleEl.querySelector('.file-count');
				if (existingCount) return; // Skip if already has count

				const folderPath = this.getFolderPathFromTitle(folderTitleEl);
				if (folderPath) {
					this.addFileCountToFolder(folderTitleEl, folderPath);
				}
			});
		}
	}

	async jumpCalendarToFileDate(file: TFile) {
		try {
			console.log('Jumping to calendar for file:', file.path);

			// Activate calendar view
			await this.activateCalendarView();

			// Get the calendar view
			const calendarLeaves = this.app.workspace.getLeavesOfType(CALENDAR_VIEW_TYPE);
			if (calendarLeaves.length > 0) {
				const calendarView = calendarLeaves[0].view as any;

				// Jump to file's modification date
				const modDate = new Date(file.stat.mtime);
				console.log('Jumping to date:', modDate);

				// Always switch to month view (save but skip file display update)
				const originalViewType = this.settings.calendarViewType;
				this.settings.calendarViewType = 'month';
				await this.saveSettings(true); // Skip file display update to prevent language switching issues

				// Update the view switcher button
				const controlsEl = (calendarView as any).controlsEl;
				if (controlsEl) {
					const viewSwitcherBtn = controlsEl.querySelector('.view-switcher-btn');
					if (viewSwitcherBtn) {
						if (typeof (calendarView as any).getViewSwitcherLabel === 'function') {
							viewSwitcherBtn.textContent = (calendarView as any).getViewSwitcherLabel();
							if (typeof (calendarView as any).getViewSwitcherTooltip === 'function') {
								viewSwitcherBtn.title = (calendarView as any).getViewSwitcherTooltip();
							}
						}
					}
				}

				// Set current date and render with highlight
				(calendarView as any).currentDate = new Date(modDate);
				const monthYearEl = (calendarView as any).monthYearEl;
				if (monthYearEl) {
					calendarView.renderCalendar(new Date(modDate), null, monthYearEl, modDate);
				}

				// Apply current language settings immediately after jump to ensure consistency
			// Use microtask to ensure this runs after all other operations
			Promise.resolve().then(() => {
				this.applyCurrentLanguageImmediately();
			});
		} else {
			console.error('No calendar view found');
		}
	} catch (error) {
		console.error('Error jumping to file date:', error);
		const errorMsg = this.settings.language === 'en' ? 'Error jumping to calendar' : '跳转到日历时出错';
		new Notice(errorMsg, 2000);
	}
	}

	scrollToFileInYearView(file: TFile) {
		// Find all file elements in the year view's month timelines
		const fileElements = document.querySelectorAll('.timeline-note-content');
		let targetElement: Element | null = null;

		fileElements.forEach((element: Element) => {
			const fileEl = element as HTMLElement;
			// Check if this element represents our target file
			const text = fileEl.textContent?.trim() || '';
			const fileNameWithoutExt = file.basename; // Get filename without .md extension

			// Match by filename (case insensitive)
			if (text.toLowerCase().includes(fileNameWithoutExt.toLowerCase())) {
				targetElement = fileEl;
			}
		});

		if (targetElement) {
			const targetEl = targetElement as HTMLElement;

			// Clear any existing highlights
			this.clearYearViewHighlights();

			// Scroll the element into view within the year view
			targetEl.scrollIntoView({
				behavior: 'smooth',
				block: 'center'
			});

			// Add highlight class
			targetEl.classList.add('year-view-file-highlight');

			console.log('Scrolled to and highlighted file in year view:', file.path);

			// Remove highlight after 3 seconds
			setTimeout(() => {
				targetEl.classList.remove('year-view-file-highlight');
			}, 3000);
		} else {
			console.log('File element not found in year view timeline:', file.path);
		}
	}

	clearYearViewHighlights() {
		const highlightedElements = document.querySelectorAll('.year-view-file-highlight');
		highlightedElements.forEach((element: Element) => {
			element.classList.remove('year-view-file-highlight');
		});
	}
}

class CalendarView extends ItemView {
	plugin: NotesDatesPlugin;

	constructor(leaf: WorkspaceLeaf, plugin: NotesDatesPlugin) {
		super(leaf);
		this.plugin = plugin;
	}

	getViewType() {
		return CALENDAR_VIEW_TYPE;
	}

	getDisplayText() {
		return getLocalizedText('notesCalendar', this.plugin.settings.language);
	}

	getIcon() {
		return "calendar-days";
	}

	async onOpen() {
		const container = this.containerEl.children[1];
		container.empty();
		container.createEl("h2", { text: getLocalizedText('notesCalendar', this.plugin.settings.language) });

		// Create calendar controls
		const controlsEl = container.createDiv("calendar-controls");

		// Previous button with icon
		const prevBtn = controlsEl.createEl("button", {
			text: "◀",
			title: this.plugin.settings.language === 'en' ? 'Previous period' : '上一个时间段'
		});
		const monthYearEl = controlsEl.createEl("span", { cls: "month-year-display" });
		// Next button with icon
		const nextBtn = controlsEl.createEl("button", {
			text: "▶",
			title: this.plugin.settings.language === 'en' ? 'Next period' : '下一个时间段'
		});

		// Add new note button
		const newNoteBtn = controlsEl.createEl("button", {
			text: "+",
			title: getLocalizedText('newNoteTooltip', this.plugin.settings.language),
			cls: "new-note-button"
		});

		// Add single view switcher button
		const viewSelectorEl = controlsEl.createDiv("view-selector-single");

		const viewSwitcherBtn = viewSelectorEl.createEl("button", {
			text: this.getViewSwitcherLabel(),
			title: this.getViewSwitcherTooltip(),
			cls: "view-switcher-btn"
		});

		viewSwitcherBtn.onclick = () => {
			// Cycle through view types: year -> month -> year
			const currentType = this.plugin.settings.calendarViewType;
			let nextType: 'month' | 'year';

			switch (currentType) {
				case 'year':
					nextType = 'month';
					break;
				case 'month':
					nextType = 'year';
					break;
			}

			// Update setting and re-render
			this.plugin.settings.calendarViewType = nextType;
			this.plugin.saveSettings();

			// Update button label
			viewSwitcherBtn.textContent = this.getViewSwitcherLabel();
			viewSwitcherBtn.title = this.getViewSwitcherTooltip();

			// Get current date reference and re-render
			const currentRef = (this as any).currentDate || new Date();
			this.renderCalendar(currentRef, null, monthYearEl);
		};

		// Add sort order selector
		const sortSelectorEl = controlsEl.createDiv("sort-selector");
		const sortBtn = sortSelectorEl.createEl("button", {
			text: this.plugin.settings.sortOrder === 'desc' ? '↓' : '↑',
			cls: "sort-button"
		});
		sortBtn.title = this.plugin.settings.sortOrder === 'desc' ?
			getLocalizedText('timeDescTooltip', this.plugin.settings.language) :
			getLocalizedText('timeAscTooltip', this.plugin.settings.language);
		sortBtn.onclick = () => {
			// Toggle sort order
			const newSortOrder = this.plugin.settings.sortOrder === 'desc' ? 'asc' : 'desc';
			this.plugin.settings.sortOrder = newSortOrder;
			this.plugin.saveSettings();

			// Update button text and title
			sortBtn.textContent = newSortOrder === 'desc' ? '↓' : '↑';
			sortBtn.title = newSortOrder === 'desc' ?
				getLocalizedText('timeDescTooltip', this.plugin.settings.language) :
				getLocalizedText('timeAscTooltip', this.plugin.settings.language);

			// Re-render current view with new sort order
			const currentRef = (this as any).currentDate || new Date();
			this.renderCalendar(currentRef, null, monthYearEl);
		};

		// Store reference to controls for use in render methods
		(this as any).controlsEl = controlsEl;
		(this as any).monthYearEl = monthYearEl;

		// Create calendar grid container
		const calendarEl = container.createDiv("calendar-grid");

		// Store reference for dynamic content updates
		(this as any).calendarEl = calendarEl;

		// Store current date reference
		const currentDate = new Date();
		(this as any).currentDate = currentDate;

		// Render calendar based on current view type
		this.renderCalendar(currentDate, null, monthYearEl);

		// Add navigation event listeners
		prevBtn.onclick = () => {
			this.navigateCalendar(-1, null, monthYearEl);
		};

		nextBtn.onclick = () => {
			this.navigateCalendar(1, null, monthYearEl);
		};

		// Add new note button handler
		newNoteBtn.onclick = () => {
			this.createNewNote();
		};
	}

	renderCalendar(date: Date, _daysEl: Element | null, monthYearEl: Element, highlightDate?: Date) {
		const viewType = this.plugin.settings.calendarViewType;
		const calendarEl = (this as any).calendarEl;

		// Clear existing content
		calendarEl.empty();

		switch (viewType) {
			case 'month':
				this.renderMonthView(date, calendarEl, monthYearEl, highlightDate);
				break;
			case 'year':
				this.renderYearView(date, calendarEl, monthYearEl, highlightDate);
				break;
		}
	}

	
	renderMonthView(date: Date, calendarEl: Element, monthYearEl: Element, highlightDate?: Date) {
		const year = date.getFullYear();
		const month = date.getMonth();

		// Add proper CSS classes to calendarEl for layout
		calendarEl.addClass('calendar-view');
		calendarEl.addClass('calendar-content');

		// Update month/year display with localization
		const monthNames = getMonthNames(this.plugin.settings.language);
		monthYearEl.textContent = `${monthNames[month]} ${year}`;

		// Create weekday headers for month view (respect user's preference for first day of week)
		const firstDayOfWeek = this.plugin.settings.calendarFirstDayOfWeek;
		const weekdayNames = getWeekdayNames(this.plugin.settings.language);
		let weekdays;
		if (firstDayOfWeek === 1) {
			// Monday first
			weekdays = [weekdayNames[1], weekdayNames[2], weekdayNames[3], weekdayNames[4], weekdayNames[5], weekdayNames[6], weekdayNames[0]];
		} else {
			// Sunday first (default)
			weekdays = [weekdayNames[0], weekdayNames[1], weekdayNames[2], weekdayNames[3], weekdayNames[4], weekdayNames[5], weekdayNames[6]];
		}

		const weekdayHeadersEl = calendarEl.createDiv("weekday-headers");

		weekdays.forEach(day => {
			weekdayHeadersEl.createEl("div", { text: day, cls: "weekday-header" });
		});

		const daysEl = calendarEl.createDiv("calendar-days month-view");

		// Calculate the first day of month, adjusted for user's preference
		let firstDayOfMonth = new Date(year, month, 1).getDay();

		// Adjust first day of month based on user's preference
		if (firstDayOfWeek === 1) {
			// Convert to Monday-first system: Sunday (0) becomes 6, others shift left
			firstDayOfMonth = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
		}

		const daysInMonth = new Date(year, month + 1, 0).getDate();

		// Get all notes for this month
		const notes = this.plugin.app.vault.getMarkdownFiles();
		const notesByDate: { [key: string]: TFile[] } = {};

		notes.forEach(note => {
			const noteDate = new Date(note.stat.mtime);
			if (noteDate.getFullYear() === year && noteDate.getMonth() === month) {
				const dateKey = noteDate.getDate().toString();
				if (!notesByDate[dateKey]) {
					notesByDate[dateKey] = [];
				}
				notesByDate[dateKey].push(note);
			}
		});

		// Add empty cells for days before month starts (using adjusted firstDayOfMonth)
		for (let i = 0; i < firstDayOfMonth; i++) {
			daysEl.createEl("div", { cls: "calendar-day empty" });
		}

		// Add days of the month
		for (let day = 1; day <= daysInMonth; day++) {
			const dayEl = daysEl.createEl("div", {
				text: day.toString(),
				cls: "calendar-day"
			});

			const currentDate = new Date(year, month, day);
			const today = new Date();
			today.setHours(0, 0, 0, 0);

			// Check if this is a future date
			if (currentDate > today) {
				dayEl.addClass("future-date");
			}

			// Check if this date should be highlighted
			if (highlightDate &&
				currentDate.getFullYear() === highlightDate.getFullYear() &&
				currentDate.getMonth() === highlightDate.getMonth() &&
				currentDate.getDate() === highlightDate.getDate()) {
				dayEl.addClass("highlighted-date");
			}

			const dayNotes = notesByDate[day.toString()];
			if (dayNotes && dayNotes.length > 0) {
				dayEl.addClass("has-notes");
				dayEl.createEl("span", {
					text: ` (${dayNotes.length})`,
					cls: "note-count"
				});

				dayEl.onclick = () => {
					this.showNotesForDate(dayNotes, day, month, year);
				};

				dayEl.title = `Click to see ${dayNotes.length} note(s)`;
			}
		}
	}

	renderWeekView(date: Date, calendarEl: Element, monthYearEl: Element, highlightDate?: Date) {
		const year = date.getFullYear();

		// Add proper CSS classes to calendarEl for layout
		calendarEl.addClass('calendar-view');
		calendarEl.addClass('calendar-content');

		// Find the start of the week (considering user's preference for first day of week)
		const startOfWeek = new Date(date);
		let day = startOfWeek.getDay();

		// Adjust for user's first day of week preference
		const firstDayOfWeek = this.plugin.settings.calendarFirstDayOfWeek;
		if (firstDayOfWeek === 1) { // Monday as first day
			day = day === 0 ? 6 : day - 1; // Convert Sunday (0) to 6, others shift left
		}

		startOfWeek.setDate(date.getDate() - day);
		startOfWeek.setHours(0, 0, 0, 0);

		// Update display to show week range
		const endOfWeek = new Date(startOfWeek);
		endOfWeek.setDate(startOfWeek.getDate() + 6);
		const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
			'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		monthYearEl.textContent = `${monthNames[startOfWeek.getMonth()]} ${startOfWeek.getDate()} - ${monthNames[endOfWeek.getMonth()]} ${endOfWeek.getDate()}, ${year}`;

		// Create week view container with timeline layout
		const weekContainer = calendarEl.createDiv("week-view-timeline-container");

		// Get all notes for this week and sort by modification time
		const notes = this.plugin.app.vault.getMarkdownFiles();
		const weekNotes: Array<{ note: TFile; noteDate: Date }> = [];

		// Debug: log the week range
		console.log('Week range:', startOfWeek.toISOString(), 'to', endOfWeek.toISOString());

		// Find notes modified within this week
		notes.forEach(note => {
			const noteDate = new Date(note.stat.mtime);
			noteDate.setHours(0, 0, 0, 0);

			// Check if note date is within the current week
			if (noteDate >= startOfWeek && noteDate <= endOfWeek) {
				weekNotes.push({ note, noteDate });
				console.log('Found note in week:', note.basename, noteDate.toISOString());
			}
		});

		// Sort notes by modification time according to settings
		if (this.plugin.settings.sortOrder === 'desc') {
			weekNotes.sort((a, b) => b.note.stat.mtime - a.note.stat.mtime);
		} else {
			weekNotes.sort((a, b) => a.note.stat.mtime - b.note.stat.mtime);
		}

		// Create timeline
		const timeline = weekContainer.createDiv("timeline");

		console.log('Total notes found this week:', weekNotes.length);

		if (weekNotes.length === 0) {
			// No notes this week
			const noNotes = timeline.createDiv("no-notes-message");
			noNotes.textContent = getLocalizedText('noNotesThisWeek', this.plugin.settings.language);
			return;
		}

		// Add each note to timeline
		weekNotes.forEach(({ note, noteDate }) => {
			// Use original modification time
			const originalModTime = new Date(note.stat.mtime);
			const timelineItem = timeline.createDiv("timeline-item");

			// Timeline dot (positioned for week view with 3-line datetime display)
			const timelineDot = timelineItem.createDiv("timeline-dot week-timeline-dot");

			// Date and time indicator (left side)
			const dateTimeIndicator = timelineItem.createDiv("timeline-datetime");

			// Localize weekday names
			const weekdayNames = getWeekdayNames(this.plugin.settings.language);
			const localeString = this.plugin.settings.language === 'en' ? 'en-US' : 'zh-CN';

			dateTimeIndicator.innerHTML = `
				<div class="timeline-date">${String(originalModTime.getDate()).padStart(2, '0')}</div>
				<div class="timeline-weekday">${weekdayNames[originalModTime.getDay()]}</div>
				<div class="timeline-time">${originalModTime.toLocaleTimeString(localeString, {
					hour: '2-digit',
					minute: '2-digit',
					second: '2-digit',
					hour12: false
				})}</div>
			`;

			// Note content area
			const noteContent = timelineItem.createDiv("timeline-note-content");

			// Make the entire note content clickable
			noteContent.style.cursor = 'pointer';
			noteContent.onclick = (e) => {
				e.preventDefault();
				e.stopPropagation();
				this.plugin.app.workspace.getLeaf().openFile(note);
			};

			// Note title
			const noteTitle = noteContent.createEl("div", {
				text: note.basename,
				cls: "timeline-note-title"
			});

			// Note path
			const notePath = noteContent.createEl("div", {
				text: note.path,
				cls: "timeline-note-path"
			});

			// Add first line of note content
			this.addFirstLineToTimeline(noteContent, note);

			// Add hover effects and tooltip
			timelineItem.title = `${note.basename}\n路径: ${note.path}\n修改时间: ${noteDate.toLocaleString('zh-CN')}`;

			// Check if this note should be highlighted
			if (highlightDate &&
				noteDate.getFullYear() === highlightDate.getFullYear() &&
				noteDate.getMonth() === highlightDate.getMonth() &&
				noteDate.getDate() === highlightDate.getDate()) {
				timelineItem.addClass("highlighted-note");
			}

			// Mark if modified today
			const today = new Date();
			today.setHours(0, 0, 0, 0);
			const noteDay = new Date(noteDate);
			noteDay.setHours(0, 0, 0, 0);

			if (noteDay.getTime() === today.getTime()) {
				timelineItem.addClass("today-note");
			}
	});
	}

	renderYearView(date: Date, calendarEl: Element, monthYearEl: Element, highlightDate?: Date) {
		const year = date.getFullYear();
		monthYearEl.textContent = `${year}`;

		// Add proper CSS classes to calendarEl for layout
		calendarEl.addClass('calendar-view');
		calendarEl.addClass('calendar-content');

		// Create year view container
		const yearContainer = calendarEl.createDiv("year-view-timeline-container");

		// Create month timeline navigation
		const monthTimeline = yearContainer.createDiv("year-month-timeline");
		const monthTimelineContainer = monthTimeline.createDiv("year-month-timeline-container");
		const monthNames = getMonthNames(this.plugin.settings.language);

		// Get all notes for this year and group by month
		const notes = this.plugin.app.vault.getMarkdownFiles();
		const notesByMonth: { [month: number]: Array<{ note: TFile; noteDate: Date }> } = {};

		// Initialize all months
		for (let i = 0; i < 12; i++) {
			notesByMonth[i] = [];
		}

		// Group notes by month
		notes.forEach(note => {
			const noteDate = new Date(note.stat.mtime);
			if (noteDate.getFullYear() === year) {
				notesByMonth[noteDate.getMonth()].push({ note, noteDate });
			}
		});

		// Sort notes in each month according to settings
		Object.keys(notesByMonth).forEach(month => {
			const monthNum = parseInt(month);
			if (this.plugin.settings.sortOrder === 'desc') {
				notesByMonth[monthNum].sort((a, b) => b.note.stat.mtime - a.note.stat.mtime);
			} else {
				notesByMonth[monthNum].sort((a, b) => a.note.stat.mtime - b.note.stat.mtime);
			}
		});

		// Create month timeline items
		const currentMonth = new Date().getMonth();
		let selectedMonth = date.getMonth();

		monthNames.forEach((monthName, monthIndex) => {
			const monthNotes = notesByMonth[monthIndex];
			const monthItem = monthTimelineContainer.createEl("div", {
				cls: "year-month-timeline-item"
			});

			// Highlight current selected month
			if (monthIndex === selectedMonth) {
				monthItem.addClass("active");
			}

			// Mark months with notes
			if (monthNotes.length > 0) {
				monthItem.addClass("has-notes");
			}

			// Create month label with localization
			const monthLabel = monthItem.createEl("div", {
				text: this.plugin.settings.language === 'en' ?
					monthNames[monthIndex].substring(0, 3) : // Jan, Feb, Mar...
					`${monthIndex + 1}月`,
				cls: "year-month-timeline-month"
			});

			// Add note count
			const noteCount = monthItem.createEl("div", {
				text: monthNotes.length.toString(),
				cls: "year-month-timeline-count"
			});

			// Add click handler to jump to month
			monthItem.onclick = () => {
				// Remove active class from all months
				monthTimelineContainer.querySelectorAll(".year-month-timeline-item").forEach(item => {
					item.removeClass("active");
				});
				// Add active class to clicked month
				monthItem.addClass("active");

				// Update selected month
				selectedMonth = monthIndex;

				// Scroll to the month section
				const monthSection = document.getElementById(`month-${monthIndex}`);
				if (monthSection) {
					monthSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
				}
			};
		});

		// Create timeline for all notes
		const timeline = yearContainer.createDiv("timeline");

		let totalNotes = 0;
		// Create month sections
		monthNames.forEach((monthName, monthIndex) => {
			const monthNotes = notesByMonth[monthIndex];
			totalNotes += monthNotes.length;

			// Create month section for all months (including empty ones)
			const monthSection = timeline.createDiv("year-month-header");
			monthSection.id = `month-${monthIndex}`;

			// Create localized month title
			let monthTitleText: string;
			if (this.plugin.settings.language === 'en') {
				monthTitleText = monthNotes.length > 0 ?
					`${monthName} (${monthNotes.length} notes)` :
					`${monthName} (No notes)`;
			} else {
				monthTitleText = monthNotes.length > 0 ?
					`${monthName} (${monthNotes.length}个笔记)` :
					`${monthName} (无笔记)`;
			}

			const monthTitle = monthSection.createEl("h3", {
				text: monthTitleText
			});

			// Add notes for this month
			monthNotes.forEach(({ note, noteDate }) => {
				const timelineItem = timeline.createDiv("timeline-item");

				// Timeline dot
				const timelineDot = timelineItem.createDiv("timeline-dot");

				// Date and time indicator (left side)
				const dateTimeIndicator = timelineItem.createDiv("timeline-datetime");

				dateTimeIndicator.innerHTML = `
					<div class="timeline-date">${String(noteDate.getMonth() + 1).padStart(2, '0')}-${String(noteDate.getDate()).padStart(2, '0')}</div>
					<div class="timeline-time">${noteDate.toLocaleTimeString('zh-CN', {
						hour: '2-digit',
						minute: '2-digit',
						second: '2-digit',
						hour12: false
					})}</div>
				`;

				// Note content area
				const noteContent = timelineItem.createDiv("timeline-note-content");

				// Make the entire note content clickable
				noteContent.style.cursor = 'pointer';
				noteContent.onclick = (e) => {
					e.preventDefault();
					e.stopPropagation();

					// Check current view type to determine action
					if (this.plugin.settings.calendarViewType === 'year') {
						// In year view, scroll to file and highlight it, then open the file
						this.scrollToFileInFileExplorer(note);
						// Add temporary highlight to the clicked file
						this.highlightFileInExplorer(note, 2000); // Highlight for 2 seconds
						// Then open the file
						this.app.workspace.getLeaf().openFile(note);
					} else {
						// In month view, jump to the specific month
						const noteMonth = noteDate.getMonth();
						const noteYear = noteDate.getFullYear();
						const monthNames = getMonthNames(this.plugin.settings.language);

						// Switch to month view
						this.plugin.settings.calendarViewType = 'month';
						this.plugin.saveSettings();

						// Update view switcher button
						const viewSwitcherBtn = document.querySelector('.view-switcher-btn');
						if (viewSwitcherBtn) {
							viewSwitcherBtn.textContent = this.getViewSwitcherLabel();
							viewSwitcherBtn.title = this.getViewSwitcherTooltip();
						}

						// Get current date reference and re-render calendar for the specific month
						const targetDate = new Date(noteYear, noteMonth, 1);
						const monthYearEl = (this as any).monthYearEl;
						if (monthYearEl) {
							this.renderCalendar(targetDate, null, monthYearEl, targetDate);
						}

						// Jump notification removed - direct navigation without interruption
					}
				};

				// Note title
				const noteTitle = noteContent.createEl("div", {
					text: note.basename,
					cls: "timeline-note-title"
				});

				// Note path
				const notePath = noteContent.createEl("div", {
					text: note.path,
					cls: "timeline-note-path"
				});

				// Add first line of note content
				this.addFirstLineToTimeline(noteContent, note);

				// Add hover effects and tooltip
				timelineItem.title = `${note.basename}\n路径: ${note.path}\n修改时间: ${noteDate.toLocaleString('zh-CN')}`;

				// Check if this note should be highlighted
				if (highlightDate &&
					noteDate.getFullYear() === highlightDate.getFullYear() &&
					noteDate.getMonth() === highlightDate.getMonth() &&
					noteDate.getDate() === highlightDate.getDate()) {
					timelineItem.addClass("highlighted-note");
				}
			});
		});

		// Show message if no notes found
		if (totalNotes === 0) {
			const noNotes = timeline.createDiv("no-notes-message");
			const noNotesText = getLocalizedText('yearNoNotes', this.plugin.settings.language);
			noNotes.textContent = `${noNotesText} ${year}`;
		}

		// Auto-scroll to current selected month
		setTimeout(() => {
			const selectedMonthItem = monthTimelineContainer.querySelector(".year-month-timeline-item.active");
			if (selectedMonthItem) {
				selectedMonthItem.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
			}
		}, 100);
	}

	async addFirstLineToTimeline(noteContent: HTMLElement, note: TFile) {
		try {
			// Read the file content
			const content = await this.plugin.app.vault.read(note);

			// Get the first non-empty line
			const lines = content.split('\n').filter(line => line.trim().length > 0);

			if (lines.length > 0) {
				let firstLine = lines[0].trim();

				// Remove markdown formatting from the first line
				firstLine = firstLine
					.replace(/^#+\s*/, '') // Remove headers
					.replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
					.replace(/\*(.*?)\*/g, '$1') // Remove italic
					.replace(/`(.*?)`/g, '$1') // Remove inline code
					.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links, keep text
					.slice(0, 100); // Limit to 100 characters

				if (firstLine.length > 0) {
					const contentPreview = noteContent.createEl("div", {
						text: firstLine,
						cls: "timeline-note-preview"
					});
				}
			}
		} catch (error) {
			// If there's an error reading the file, just don't show the preview
			console.debug('Error reading file content for preview:', note.path, error);
		}
	}


	showNotesForDate(notes: TFile[], day: number, month: number, year: number) {
		const modal = new DateNotesModal(this.plugin.app, notes, day, month, year, this.plugin);
		modal.open();
	}

	async createNewNote() {
		const now = new Date();
		const year = now.getFullYear();
		const month = String(now.getMonth() + 1).padStart(2, '0');
		const day = String(now.getDate()).padStart(2, '0');
		const hour = String(now.getHours()).padStart(2, '0');
		const minute = String(now.getMinutes()).padStart(2, '0');
		const second = String(now.getSeconds()).padStart(2, '0');

		const fileName = `${year}-${month}-${day}-${hour}${minute}${second}.md`;

		try {
			// Create the new note file
			const newFile = await this.plugin.app.vault.create(fileName, '');

			// Open the new file in a new pane
			await this.plugin.app.workspace.getLeaf(true).openFile(newFile);

			new Notice(`${getLocalizedText('newNoteCreated', this.plugin.settings.language)} ${fileName}`);
		} catch (error) {
			new Notice(`${getLocalizedText('createNoteFailed', this.plugin.settings.language)} ${error.message}`);
		}
	}

	getViewSwitcherLabel(): string {
		const currentType = this.plugin.settings.calendarViewType;
		switch (currentType) {
			case 'year':
				return getLocalizedText('yearToMonth', this.plugin.settings.language);
			case 'month':
				return getLocalizedText('monthToYear', this.plugin.settings.language);
			default:
				return getLocalizedText('yearToMonth', this.plugin.settings.language);
		}
	}

	getViewTypeLabel(): string {
		const currentType = this.plugin.settings.calendarViewType;
		switch (currentType) {
			case 'year':
				return getLocalizedText('yearView', this.plugin.settings.language);
			case 'month':
				return getLocalizedText('monthView', this.plugin.settings.language);
			default:
				return getLocalizedText('yearView', this.plugin.settings.language);
		}
	}

	getViewSwitcherTooltip(): string {
		const currentType = this.getViewTypeLabel();
		const tooltipTemplate = getLocalizedText('switchViewTooltip', this.plugin.settings.language);
		return tooltipTemplate.replace('{current}', currentType);
	}

	scrollToFileInFileExplorer(file: TFile) {
		// Get all file elements and sort them by creation/modification time to match file explorer order
		const fileElements = document.querySelectorAll('.nav-file-title');
		let targetFileElement: HTMLElement | null = null;

		// Create array of file elements with their timestamps for sorting
		const fileElementsWithTime: Array<{ element: HTMLElement; time: number }> = [];
		fileElements.forEach((element: Element) => {
			const fileEl = element as HTMLElement;
			const filePath = fileEl.getAttribute('data-path');
			if (filePath) {
				const noteFile = this.plugin.app.vault.getAbstractFileByPath(filePath);
				if (noteFile && noteFile instanceof TFile) {
					// Use creation time for consistent ordering (matches file explorer behavior)
					const fileTime = noteFile.stat.ctime;
					fileElementsWithTime.push({ element: fileEl, time: fileTime });
				}
			}
		});

		// Sort files by time (newest first)
		fileElementsWithTime.sort((a, b) => b.time - a.time);

		// Find the target file element
		fileElementsWithTime.forEach(({ element, time }) => {
			const filePath = element.getAttribute('data-path');
			if (filePath === file.path) {
				targetFileElement = element;
			}
		});

		if (targetFileElement) {
			// Use requestAnimationFrame to ensure DOM is ready
			requestAnimationFrame(() => {
				// Scroll the file element into view smoothly
				targetFileElement.scrollIntoView({
					behavior: 'smooth',
					block: 'center'
				});

				// Add temporary visual feedback
				targetFileElement.classList.add('file-scroll-highlight');
				setTimeout(() => {
					if (targetFileElement) {
						targetFileElement.classList.remove('file-scroll-highlight');
					}
				}, 1500);
			});
		}
	}

	highlightFileInExplorer(file: TFile, duration: number) {
		// Clear any existing highlights first to avoid conflicts
		this.clearAllHighlights();

		// Find and highlight only the target file
		const fileElements = document.querySelectorAll('.nav-file-title');
		fileElements.forEach((element: Element) => {
			const fileEl = element as HTMLElement;
			const filePath = fileEl.getAttribute('data-path');
			if (filePath === file.path) {
				fileEl.classList.add('file-click-highlight');
			}
		});

		// Remove highlight after specified duration
		setTimeout(() => {
			this.clearAllHighlights();
		}, duration);
	}

	clearAllHighlights() {
		// Remove all highlight classes to ensure clean state
		const highlightedScrollElements = document.querySelectorAll('.file-scroll-highlight');
		const highlightedClickElements = document.querySelectorAll('.file-click-highlight');

		highlightedScrollElements.forEach((element: Element) => {
			element.classList.remove('file-scroll-highlight');
		});

		highlightedClickElements.forEach((element: Element) => {
			element.classList.remove('file-click-highlight');
		});
	}

	async onClose() {
		// Nothing to clean up
	}

	navigateCalendar(direction: number, _daysEl: Element | null, monthYearEl: Element) {
		const currentDate = (this as any).currentDate || new Date();
		const viewType = this.plugin.settings.calendarViewType;

		switch (viewType) {
			case 'month':
				currentDate.setMonth(currentDate.getMonth() + direction);
				break;
			case 'year':
				currentDate.setFullYear(currentDate.getFullYear() + direction);
				break;
		}

		(this as any).currentDate = new Date(currentDate);
		this.renderCalendar((this as any).currentDate, null, monthYearEl);
	}

	jumpToDate(date: Date) {
		// Update calendar to show the specified date
		const monthYearEl = (this as any).monthYearEl;

		if (monthYearEl) {
			// Highlight the target date when rendering
			this.renderCalendar(date, null, monthYearEl, date);

			// Remove highlight after 3 seconds to draw attention but not be permanent
			setTimeout(() => {
				this.renderCalendar(date, null, monthYearEl);
			}, 3000);
		}
	}
}

class DateNotesModal extends Modal {
	notes: TFile[];
	day: number;
	month: number;
	year: number;
	plugin: NotesDatesPlugin;

	constructor(app: App, notes: TFile[], day: number, month: number, year: number, plugin: NotesDatesPlugin) {
		super(app);
		this.notes = notes;
		this.day = day;
		this.month = month;
		this.year = year;
		this.plugin = plugin;
	}

	async onOpen() {
		const { contentEl } = this;

		// Create header container
		const headerContainer = contentEl.createDiv("modal-header-container");

		// Title with localization
		const monthNames = getMonthNames(this.plugin.settings.language);
		const titleSuffix = this.plugin.settings.language === 'en' ? 'notes' : '的笔记';
		headerContainer.createEl("h2", {
			text: `${monthNames[this.month]} ${this.day}, ${this.year} ${titleSuffix}`
		});

		// Sort controls
		const sortControls = headerContainer.createDiv("modal-sort-controls");
		sortControls.style.marginTop = '1rem';

		const sortBtn = sortControls.createEl("button", {
			text: this.plugin.settings.sortOrder === 'desc' ?
				(this.plugin.settings.language === 'en' ? '↓ Time Desc' : '↓ 时间降序') :
				(this.plugin.settings.language === 'en' ? '↑ Time Asc' : '↑ 时间升序'),
			cls: "sort-button"
		});
		sortBtn.style.marginRight = '0.5rem';

		sortBtn.onclick = () => {
			// Toggle sort order
			const newSortOrder = this.plugin.settings.sortOrder === 'desc' ? 'asc' : 'desc';
			this.plugin.settings.sortOrder = newSortOrder;
			this.plugin.saveSettings();

			// Update button text with localization
			sortBtn.textContent = newSortOrder === 'desc' ?
				(this.plugin.settings.language === 'en' ? '↓ Time Desc' : '↓ 时间降序') :
				(this.plugin.settings.language === 'en' ? '↑ Time Asc' : '↑ 时间升序');

			// Update button title with localization
			sortBtn.title = newSortOrder === 'desc' ?
				(this.plugin.settings.language === 'en' ? 'Time Desc (Newest first)' : '时间降序 (最新在前)') :
				(this.plugin.settings.language === 'en' ? 'Time Asc (Oldest first)' : '时间升序 (最旧在前)');

			// Re-render the timeline
			this.renderTimeline();
		};

		// Create timeline container
		const timelineContainer = contentEl.createDiv("modal-timeline-container");

		// Store references for re-rendering
		(this as any).timelineContainer = timelineContainer;

		// Initial render
		this.renderTimeline();
	}

	async renderTimeline() {
		const timelineContainer = (this as any).timelineContainer;
		timelineContainer.empty();

		// Sort notes by modification time according to settings
		if (this.plugin.settings.sortOrder === 'desc') {
			this.notes.sort((a, b) => b.stat.mtime - a.stat.mtime);
		} else {
			this.notes.sort((a, b) => a.stat.mtime - b.stat.mtime);
		}

		const timeline = timelineContainer.createDiv("timeline");

		for (const note of this.notes) {
			const noteDate = new Date(note.stat.mtime);
			const timelineItem = timeline.createDiv("timeline-item");

			// Timeline dot (positioned for modal with 3-line datetime display)
			const timelineDot = timelineItem.createDiv("timeline-dot modal-timeline-dot");

			// Date and time indicator (left side)
			const dateTimeIndicator = timelineItem.createDiv("timeline-datetime");

			// Localize weekday names
			const weekdayNames = getWeekdayNames(this.plugin.settings.language);
			const localeString = this.plugin.settings.language === 'en' ? 'en-US' : 'zh-CN';

			dateTimeIndicator.innerHTML = `
				<div class="timeline-date">${String(noteDate.getMonth() + 1).padStart(2, '0')}-${String(noteDate.getDate()).padStart(2, '0')}</div>
				<div class="timeline-weekday" style="font-size: 1.1em;">${weekdayNames[noteDate.getDay()]}</div>
				<div class="timeline-time">${noteDate.toLocaleTimeString(localeString, {
					hour: '2-digit',
					minute: '2-digit',
					second: '2-digit',
					hour12: false
				})}</div>
			`;

			// Note content area
			const noteContent = timelineItem.createDiv("timeline-note-content");

			// Make the entire note content clickable
			noteContent.style.cursor = 'pointer';
			noteContent.onclick = (e) => {
				e.preventDefault();
				e.stopPropagation();
				this.app.workspace.getLeaf().openFile(note);
				this.close();
			};

			// Note title
			const noteTitle = noteContent.createEl("div", {
				text: note.basename,
				cls: "timeline-note-title"
			});

			// Note path
			const notePath = noteContent.createEl("div", {
				text: note.path,
				cls: "timeline-note-path"
			});

			// Add first line of note content
			await this.addFirstLineToModal(noteContent, note);

			// Add hover effects and tooltip
			timelineItem.title = `${note.basename}\n路径: ${note.path}\n修改时间: ${noteDate.toLocaleString('zh-CN')}`;
		}
	}

	async addFirstLineToModal(noteContent: HTMLElement, note: TFile) {
		try {
			// Read the file content
			const content = await this.app.vault.read(note);

			// Get the first non-empty line
			const lines = content.split('\n').filter(line => line.trim().length > 0);

			if (lines.length > 0) {
				let firstLine = lines[0].trim();

				// Remove markdown formatting from the first line
				firstLine = firstLine
					.replace(/^#+\s*/, '') // Remove headers
					.replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
					.replace(/\*(.*?)\*/g, '$1') // Remove italic
					.replace(/`(.*?)`/g, '$1') // Remove inline code
					.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links, keep text
					.slice(0, 100); // Limit to 100 characters

				if (firstLine.length > 0) {
					const contentPreview = noteContent.createEl("div", {
						text: firstLine,
						cls: "timeline-note-preview"
					});
				}
			}
		} catch (error) {
			// If there's an error reading the file, just don't show the preview
			console.debug('Error reading file content for preview:', note.path, error);
		}
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class NotesDatesSettingTab extends PluginSettingTab {
	plugin: NotesDatesPlugin;

	constructor(app: App, plugin: NotesDatesPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		// Plugin description with GitHub links
		const descEl = containerEl.createEl('div', { cls: 'setting-item-description' });
		descEl.innerHTML = `
			<h3>Notes Dates & Calendar Plugin</h3>
			<p><strong>Features:</strong></p>
			<ul>
				<li>Display creation and modification dates for notes in file explorer</li>
				<li>Show file and note counts in folders</li>
				<li>Interactive calendar view (Month, Week, Year) for browsing notes by date</li>
				<li>Jump to specific dates in calendar by clicking on files</li>
				<li>Sort notes by modification time (ascending/descending)</li>
				<li>Create new notes with current timestamp</li>
			</ul>
			<p>
				<strong>GitHub:</strong>
				<a href="https://github.com/your-username/notes-dates-calendar" target="_blank">Repository</a> |
				<a href="https://github.com/your-username/notes-dates-calendar/issues" target="_blank">Report a Bug</a>
			</p>
			<hr style="margin: 1rem 0; opacity: 0.2;">
		`;

		containerEl.createEl('h2', { text: 'Settings' });

		new Setting(containerEl)
			.setName('Show Creation Date')
			.setDesc('Display creation date in file explorer')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.showCreationDate)
				.onChange(async (value) => {
					this.plugin.settings.showCreationDate = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Show Modification Date')
			.setDesc('Display modification date in file explorer')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.showModificationDate)
				.onChange(async (value) => {
					this.plugin.settings.showModificationDate = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Date Format')
			.setDesc('Format for displaying dates (using moment.js format)')
			.addText(text => text
				.setPlaceholder('YYYY-MM-DD')
				.setValue(this.plugin.settings.dateFormat)
				.onChange(async (value) => {
					this.plugin.settings.dateFormat = value;
					await this.plugin.saveSettings();
				}));

				new Setting(containerEl)
			.setName('Show File Count in Folders')
			.setDesc('Display the number of markdown files and notes in each folder')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.showFileCount)
				.onChange(async (value) => {
					this.plugin.settings.showFileCount = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Show Subdirectory Statistics')
			.setDesc('Display detailed file and note counts for subdirectories in folder titles')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.showSubdirectoryStats)
				.onChange(async (value) => {
					this.plugin.settings.showSubdirectoryStats = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Calendar First Day of Week')
			.setDesc('Set the first day of the week in calendar (0 = Sunday, 1 = Monday)')
			.addDropdown(dropdown => dropdown
				.addOption('0', 'Sunday')
				.addOption('1', 'Monday')
				.setValue(this.plugin.settings.calendarFirstDayOfWeek.toString())
				.onChange(async (value) => {
					this.plugin.settings.calendarFirstDayOfWeek = parseInt(value);
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Calendar View Type')
			.setDesc('Choose the default calendar view type')
			.addDropdown(dropdown => dropdown
				.addOption('month', 'Month View')
				.addOption('year', 'Year View')
				.setValue(this.plugin.settings.calendarViewType)
				.onChange(async (value) => {
					this.plugin.settings.calendarViewType = value as 'month' | 'year';
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Calendar Sort Order')
			.setDesc('Choose the default sort order for calendar notes')
			.addDropdown(dropdown => dropdown
				.addOption('desc', 'Newest First (Time Descending)')
				.addOption('asc', 'Oldest First (Time Ascending)')
				.setValue(this.plugin.settings.sortOrder)
				.onChange(async (value) => {
					this.plugin.settings.sortOrder = value as 'desc' | 'asc';
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Language')
			.setDesc('Choose the interface language')
			.addDropdown(dropdown => dropdown
				.addOption('en', 'English')
				.addOption('zh', '中文')
				.setValue(this.plugin.settings.language)
				.onChange(async (value) => {
					this.plugin.settings.language = value as 'en' | 'zh';
					await this.plugin.saveSettings();

					// Re-render the calendar view with new language
					const calendarView = this.plugin.app.workspace.getLeavesOfType(CALENDAR_VIEW_TYPE)[0]?.view;
					if (calendarView) {
						// Update the H2 title with new language
						const container = calendarView.containerEl.children[1];
						if (container) {
							const titleElement = container.querySelector('h2');
							if (titleElement) {
								titleElement.textContent = getLocalizedText('notesCalendar', this.plugin.settings.language);
							}
						}

						// Update calendar content
						const monthYearEl = (calendarView as any).monthYearEl;
						if (monthYearEl) {
							const currentDate = (calendarView as any).currentDate || new Date();
							calendarView.renderCalendar(currentDate, null, monthYearEl);
						}
					}

					// Update file explorer counts with new language
					this.plugin.updateAllFilesDisplay();

					// Update button tooltips with new language
					const existingCalendarView = this.plugin.app.workspace.getLeavesOfType(CALENDAR_VIEW_TYPE)[0]?.view;
					if (existingCalendarView) {
						const controlsEl = (existingCalendarView as any).controlsEl;
						if (controlsEl) {
							const prevBtn = controlsEl.querySelector('button');
							const nextBtn = controlsEl.querySelector('button:nth-of-type(2)');
							if (prevBtn) {
								prevBtn.title = this.plugin.settings.language === 'en' ? 'Previous period' : '上一个时间段';
							}
							if (nextBtn) {
								nextBtn.title = this.plugin.settings.language === 'en' ? 'Next period' : '下一个时间段';
							}
						}
					}
				}));

			}
}

// Export the plugin class for CommonJS
module.exports = NotesDatesPlugin;

