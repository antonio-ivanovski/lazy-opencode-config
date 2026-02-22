import React from 'react';
import {Box, Text} from 'ink';
import type {TreeNode} from '../types/index.js';
import type {ValidationError} from '../lib/validation.js';
import {getErrorsForPath} from '../lib/validation.js';

type Props = {
	focusedNode: TreeNode | null;
	validationErrors: ValidationError[];
};

export default function DetailsPanel({focusedNode, validationErrors}: Props) {
	if (!focusedNode) {
		return (
			<Box
				flexDirection="column"
				paddingX={2}
				paddingY={1}
				borderStyle="round"
				borderColor="gray"
			>
				<Text dimColor>Navigate the tree to view property details</Text>
				<Text> </Text>
				<Text dimColor>Use ↑↓ or j/k to move</Text>
				<Text dimColor>Press ? for help</Text>
			</Box>
		);
	}

	const node = focusedNode;
	const errors = getErrorsForPath(validationErrors, node.path);
	const nodeErrors = errors.filter(e => e.severity === 'error');
	const nodeWarnings = errors.filter(e => e.severity === 'warning');

	const typeDisplay =
		node.schema.type === 'enum'
			? `enum (${node.schema.enumValues?.join(' | ') ?? ''})`
			: node.schema.type;

	const formatValue = (val: unknown): string => {
		if (val === undefined) return '(not set)';
		if (typeof val === 'object') return JSON.stringify(val, null, 2);
		return String(val);
	};

	const sourceLabel = node.isSet
		? 'Set locally'
		: node.inheritedFrom === 'global'
		? 'Inherited from global'
		: node.inheritedFrom === 'default'
		? 'Schema default'
		: 'Not set';

	const sourceColor = node.isSet
		? '#4CAF50'
		: node.inheritedFrom === 'global'
		? '#00BCD4'
		: 'gray';

	return (
		<Box
			flexDirection="column"
			paddingX={2}
			paddingY={1}
			borderStyle="round"
			borderColor="#00BCD4"
		>
			{/* Property name in title */}
			<Text bold color="#00BCD4">
				{node.key}
			</Text>
			<Text> </Text>

			{/* Description */}
			{node.schema.description && (
				<>
					<Text wrap="wrap" dimColor>
						{node.schema.description}
					</Text>
					<Text> </Text>
				</>
			)}

			{/* Metadata table */}
			<Box flexDirection="column">
				<Box>
					<Box width={12}>
						<Text dimColor>Type</Text>
					</Box>
					<Text>{typeDisplay}</Text>
				</Box>
				<Box>
					<Box width={12}>
						<Text dimColor>Current</Text>
					</Box>
					<Text bold color={node.isSet ? '#00BCD4' : 'gray'}>
						{formatValue(node.value)}
					</Text>
				</Box>
				{node.defaultValue !== undefined && (
					<Box>
						<Box width={12}>
							<Text dimColor>Default</Text>
						</Box>
						<Text dimColor>{String(node.defaultValue)}</Text>
					</Box>
				)}
				<Box>
					<Box width={12}>
						<Text dimColor>Source</Text>
					</Box>
					<Text color={sourceColor}>{sourceLabel}</Text>
				</Box>
				{node.effectiveValue !== undefined &&
					node.effectiveValue !== node.value && (
						<Box>
							<Box width={12}>
								<Text dimColor>Effective</Text>
							</Box>
							<Text>{formatValue(node.effectiveValue)}</Text>
						</Box>
					)}
			</Box>

			{/* Enum values */}
			{node.schema.enumValues && node.schema.enumValues.length > 0 && (
				<>
					<Text> </Text>
					<Text dimColor>Allowed values:</Text>
					{node.schema.enumValues.map(v => (
						<Box key={v}>
							<Text color={v === String(node.value) ? '#00BCD4' : 'gray'}>
								{v === String(node.value) ? '● ' : '  '}
							</Text>
							<Text bold={v === String(node.value)}>{v}</Text>
						</Box>
					))}
				</>
			)}

			{/* Min/Max */}
			{(node.schema.minimum !== undefined ||
				node.schema.maximum !== undefined) && (
				<>
					<Text> </Text>
					<Box>
						<Box width={12}>
							<Text dimColor>Range</Text>
						</Box>
						<Text>
							{node.schema.minimum ?? '...'} – {node.schema.maximum ?? '...'}
						</Text>
					</Box>
				</>
			)}

			{/* Deprecated */}
			{node.deprecated && (
				<>
					<Text> </Text>
					<Text color="#FF9800">⚠ Deprecated</Text>
					{node.deprecatedMessage && (
						<Text dimColor> {node.deprecatedMessage}</Text>
					)}
				</>
			)}

			{/* Validation section */}
			<Text> </Text>
			<Text dimColor>────── Validation ──────</Text>
			{nodeErrors.length === 0 && nodeWarnings.length === 0 && (
				<Text color="#4CAF50">✓ Valid</Text>
			)}
			{nodeErrors.map(e => (
				<Text key={e.path + e.message} color="#F44336">
					✗ {e.message}
				</Text>
			))}
			{nodeWarnings.map(e => (
				<Text key={e.path + e.message} color="#FF9800">
					⚠ {e.message}
				</Text>
			))}
		</Box>
	);
}
