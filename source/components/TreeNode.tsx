import React from 'react';
import {Box, Text} from 'ink';
import type {TreeNode as TreeNodeType} from '../types/index.js';
import type {ValidationError} from '../lib/validation.js';
import {getRenderer} from '../lib/renderer-registry.js';

type Props = {
	node: TreeNodeType;
	isCursor: boolean;
	isEditing: boolean;
	isExpanded: boolean;
	errors: ValidationError[];
	onEditComplete: (value: unknown) => void;
	onEditCancel: () => void;
};

function formatRawValue(val: unknown): string {
	if (typeof val === 'string')
		return val.length > 30 ? val.slice(0, 27) + '..' : val;
	if (typeof val === 'boolean') return String(val);
	if (typeof val === 'number') return String(val);
	if (val === null) return 'null';
	return String(val);
}

type DisplayInfo = {
	text: string;
	suffix?: string;
	dim: boolean;
	useBooleanIcon?: boolean;
	boolValue?: boolean;
};

function getDisplayInfo(node: TreeNodeType): DisplayInfo {
	if (node.isSet) {
		if (typeof node.value === 'boolean') {
			return {
				text: node.value ? '✓' : '✗',
				dim: false,
				useBooleanIcon: true,
				boolValue: node.value,
			};
		}
		return {text: formatRawValue(node.value), dim: false};
	}
	if (node.inheritedValue !== undefined) {
		if (typeof node.inheritedValue === 'boolean') {
			return {
				text: node.inheritedValue ? '✓' : '✗',
				suffix: ' ← global',
				dim: true,
				useBooleanIcon: true,
				boolValue: node.inheritedValue,
			};
		}
		return {
			text: formatRawValue(node.inheritedValue),
			suffix: ' ← global',
			dim: true,
		};
	}
	if (node.defaultValue !== undefined) {
		return {
			text: `(default: ${String(node.defaultValue)})`,
			dim: true,
		};
	}
	return {text: '(not set)', dim: true};
}

export default function TreeNode({
	node,
	isCursor,
	isEditing,
	isExpanded,
	errors,
	onEditComplete,
	onEditCancel,
}: Props) {
	const indent = '  '.repeat(node.depth);
	const hasErrors = errors.some(e => e.severity === 'error');
	const hasWarnings = errors.some(e => e.severity === 'warning');

	// If editing, render the appropriate editor
	if (isEditing) {
		const Renderer = getRenderer(node.path, node.schema);
		if (Renderer) {
			return (
				<Box>
					<Text>{indent}</Text>
					<Text bold>{node.key}: </Text>
					<Renderer
						node={node}
						value={node.value}
						schema={node.schema}
						onChange={onEditComplete}
						onCancel={onEditCancel}
					/>
				</Box>
			);
		}
	}

	// Branch node (object/array)
	if (!node.isLeaf) {
		const arrow = isExpanded ? '▼' : '▶';
		const childCount = node.children.length;
		const bracket = `(${childCount})`;

		return (
			<Box>
				{isCursor && <Text color="#00BCD4">▌</Text>}
				{!isCursor && <Text> </Text>}
				<Text>{indent}</Text>
				<Text color="#00BCD4">{arrow} </Text>
				<Text bold={isCursor} color={isCursor ? undefined : 'white'}>
					{node.key}
				</Text>
				<Text dimColor> {bracket}</Text>
				{node.deprecated && (
					<Text color="#FF9800" strikethrough>
						{' [deprecated]'}
					</Text>
				)}
				{node.unknown && <Text color="#FF9800"> [unknown]</Text>}
				{hasErrors && <Text color="#F44336"> ●</Text>}
				{hasWarnings && !hasErrors && <Text color="#FF9800"> ●</Text>}
			</Box>
		);
	}

	// Leaf node
	const displayInfo = getDisplayInfo(node);
	const isUnset = !node.isSet;

	return (
		<Box>
			{isCursor && <Text color="#00BCD4">▌</Text>}
			{!isCursor && <Text> </Text>}
			<Text>{indent}</Text>
			<Text
				bold={isCursor}
				dimColor={isUnset}
				color={isCursor ? undefined : 'white'}
			>
				{node.key}
			</Text>
			<Text dimColor>: </Text>
			<Text
				dimColor={isUnset && !displayInfo.useBooleanIcon}
				color={
					hasErrors
						? '#F44336'
						: displayInfo.useBooleanIcon
						? displayInfo.boolValue
							? '#4CAF50'
							: '#F44336'
						: displayInfo.dim
						? 'gray'
						: '#00BCD4'
				}
			>
				{displayInfo.text}
			</Text>
			{displayInfo.suffix && <Text dimColor>{displayInfo.suffix}</Text>}
			{node.deprecated && (
				<Text color="#FF9800" dimColor>
					{' '}
					<Text strikethrough>[deprecated]</Text>
				</Text>
			)}
			{node.unknown && <Text color="#FF9800"> [unknown]</Text>}
			{hasErrors && <Text color="#F44336"> ●</Text>}
			{hasWarnings && !hasErrors && <Text color="#FF9800"> ●</Text>}
		</Box>
	);
}
