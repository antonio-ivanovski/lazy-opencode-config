import React, {useState, useMemo} from 'react';
import {Box, Text, useInput, useStdout} from 'ink';
import type {TreeNode as TreeNodeType} from '../types/index.js';
import type {ValidationError} from '../lib/validation.js';
import TreeNode from './TreeNode.js';
import AddEntryDialog from './AddEntryDialog.js';
import {getErrorsForPath} from '../lib/validation.js';
import {getDefaultValueForSchema} from '../lib/tree-model.js';

type Props = {
	visibleNodes: TreeNodeType[];
	cursorIndex: number;
	expandedPaths: Set<string>;
	focusedNode: TreeNodeType | null;
	validationErrors: ValidationError[];
	mode: 'browse' | 'edit' | 'search';
	onMoveCursor: (delta: number) => void;
	onSetCursor: (index: number) => void;
	onToggleExpand: (path: string) => void;
	onToggleShowUnset: () => void;
	onEditValue: (path: string[], value: unknown) => void;
	onDeleteValue: (path: string[]) => void;
	onSwitchScope: () => void;
	onSave: () => void;
	onQuit: () => void;
	onShowHelp: () => void;
	onStartSearch: () => void;
	onStartEdit: () => void;
	onEndEdit: () => void;
	onUndo: () => void;
};

type AddingEntryState = {
	parentPath: string;
	parentLabel: string;
	existingKeys: string[];
	type: 'record' | 'array';
};

export default function TreeView({
	visibleNodes,
	cursorIndex,
	expandedPaths,
	focusedNode,
	validationErrors,
	mode,
	onMoveCursor,
	onSetCursor: _onSetCursor,
	onToggleExpand,
	onToggleShowUnset,
	onEditValue,
	onDeleteValue,
	onSwitchScope,
	onSave,
	onQuit,
	onShowHelp,
	onStartSearch,
	onStartEdit,
	onEndEdit,
	onUndo,
}: Props) {
	const {stdout} = useStdout();
	const viewHeight = (stdout?.rows ?? 24) - 6; // Subtract header + status
	const [editingPath, setEditingPath] = useState<string | null>(null);
	const [addingEntry, setAddingEntry] = useState<AddingEntryState | null>(null);

	// Viewport windowing
	const scrollOffset = useMemo(() => {
		if (cursorIndex < 0) return 0;
		const halfView = Math.floor(viewHeight / 2);
		let offset = cursorIndex - halfView;
		offset = Math.max(0, offset);
		offset = Math.min(Math.max(0, visibleNodes.length - viewHeight), offset);
		return offset;
	}, [cursorIndex, viewHeight, visibleNodes.length]);

	const visibleSlice = visibleNodes.slice(
		scrollOffset,
		scrollOffset + viewHeight,
	);

	useInput((input, key) => {
		if (addingEntry) return; // Let AddEntryDialog handle input
		if (mode === 'edit') return; // Let the renderer handle input during edit

		// Navigation
		if (key.upArrow || input === 'k') onMoveCursor(-1);
		if (key.downArrow || input === 'j') onMoveCursor(1);

		// Expand/collapse
		if (
			(key.rightArrow || input === 'l') &&
			focusedNode &&
			!focusedNode.isLeaf
		) {
			if (!expandedPaths.has(focusedNode.path))
				onToggleExpand(focusedNode.path);
		}
		if ((key.leftArrow || input === 'h') && focusedNode) {
			if (!focusedNode.isLeaf && expandedPaths.has(focusedNode.path)) {
				onToggleExpand(focusedNode.path);
			}
		}

		// Enter — expand branch or edit leaf
		if (key.return && focusedNode) {
			if (focusedNode.isLeaf) {
				setEditingPath(focusedNode.path);
				onStartEdit();
			} else {
				onToggleExpand(focusedNode.path);
			}
		}

		// 'a' — add entry to record or array branch
		if (input === 'a' && focusedNode && !focusedNode.isLeaf) {
			const schema = focusedNode.schema;
			if (schema.additionalProperties && schema.type === 'object') {
				// Record-type node
				setAddingEntry({
					parentPath: focusedNode.path,
					parentLabel: focusedNode.key,
					existingKeys: focusedNode.children.map(c => c.key),
					type: 'record',
				});
				onStartEdit();
			} else if (schema.type === 'array') {
				// Array-type node — use simple add flow
				setAddingEntry({
					parentPath: focusedNode.path,
					parentLabel: focusedNode.key,
					existingKeys: [],
					type: 'array',
				});
				onStartEdit();
			}
		}

		// Keybind actions
		if (input === 'H') onToggleShowUnset();
		if (input === '/') onStartSearch();
		if (input === 's' || (key.ctrl && input === 's')) onSave();
		if (input === '?') onShowHelp();
		if (input === 'u' || (key.ctrl && input === 'z')) onUndo();

		// Delete (leaf only, must be set)
		if (input === 'd' && focusedNode && focusedNode.isSet) {
			onDeleteValue(focusedNode.path.split('.'));
		}

		// Hard delete — works on any node including branch nodes
		if (input === 'D' && focusedNode) {
			onDeleteValue(focusedNode.path.split('.'));
		}

		// Tab — switch scope
		if (key.tab) onSwitchScope();

		// Quit
		if (input === 'q') onQuit();
	});

	const handleEditComplete = (path: string[], value: unknown) => {
		onEditValue(path, value);
		setEditingPath(null);
		onEndEdit();
	};

	const handleEditCancel = () => {
		setEditingPath(null);
		onEndEdit();
	};

	const handleAddEntryConfirm = (key: string) => {
		if (!addingEntry) return;
		const parentPathParts = addingEntry.parentPath
			? addingEntry.parentPath.split('.')
			: [];
		const fullPath = [...parentPathParts, key];

		if (addingEntry.type === 'record') {
			const schema = focusedNode?.schema;
			const addlSchema =
				schema?.additionalProperties &&
				typeof schema.additionalProperties === 'object'
					? schema.additionalProperties
					: undefined;
			const defaultVal = addlSchema ? getDefaultValueForSchema(addlSchema) : {};
			onEditValue(fullPath, defaultVal);
			// Expand the parent node after adding
			if (!expandedPaths.has(addingEntry.parentPath)) {
				onToggleExpand(addingEntry.parentPath);
			}
		} else {
			// Array: append to existing array
			const currentVal = focusedNode?.value;
			const currentArr = Array.isArray(currentVal) ? currentVal : [];
			onEditValue(parentPathParts, [...currentArr, key]);
		}

		setAddingEntry(null);
		onEndEdit();
	};

	const handleAddEntryCancel = () => {
		setAddingEntry(null);
		onEndEdit();
	};

	return (
		<Box flexDirection="column">
			{addingEntry && (
				<AddEntryDialog
					parentPath={addingEntry.parentPath}
					parentLabel={addingEntry.parentLabel}
					existingKeys={addingEntry.existingKeys}
					onConfirm={handleAddEntryConfirm}
					onCancel={handleAddEntryCancel}
				/>
			)}
			{!addingEntry &&
				visibleSlice.map((node, i) => {
					const absoluteIndex = scrollOffset + i;
					const isCursor = absoluteIndex === cursorIndex;
					const isEditing = editingPath === node.path;
					const nodeErrors = getErrorsForPath(validationErrors, node.path);
					const isExpanded = expandedPaths.has(node.path);

					return (
						<TreeNode
							key={node.id}
							node={node}
							isCursor={isCursor}
							isEditing={isEditing}
							isExpanded={isExpanded}
							errors={nodeErrors}
							onEditComplete={value =>
								handleEditComplete(node.path.split('.'), value)
							}
							onEditCancel={handleEditCancel}
						/>
					);
				})}
			{!addingEntry && visibleNodes.length === 0 && (
				<Text dimColor>No config entries to display</Text>
			)}
		</Box>
	);
}
