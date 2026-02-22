import React, {useState, useMemo} from 'react';
import {Box, Text, useInput} from 'ink';
import TextInput from 'ink-text-input';
import type {TreeNode} from '../types/index.js';

type Props = {
	allNodes: TreeNode[];
	onSelect: (path: string) => void;
	onCancel: () => void;
};

export default function SearchOverlay({allNodes, onSelect, onCancel}: Props) {
	const [query, setQuery] = useState('');
	const [selectedIndex, setSelectedIndex] = useState(0);

	// Compute filtered results; reset selection inside memo on query change
	const results = useMemo(() => {
		setSelectedIndex(0);
		if (!query.trim()) return [];
		const q = query.toLowerCase();
		return allNodes
			.filter(
				n =>
					n.key.toLowerCase().includes(q) ||
					n.path.toLowerCase().includes(q) ||
					(n.schema.description?.toLowerCase().includes(q) ?? false),
			)
			.slice(0, 15);
	}, [query, allNodes]);

	useInput((_input, key) => {
		if (key.escape) {
			onCancel();
			return;
		}
		if (key.return && results.length > 0) {
			const result = results[selectedIndex];
			if (result) onSelect(result.path);
			return;
		}
		if (key.downArrow)
			setSelectedIndex(i => Math.min(results.length - 1, i + 1));
		if (key.upArrow) setSelectedIndex(i => Math.max(0, i - 1));
	});

	return (
		<Box
			flexDirection="column"
			borderStyle="round"
			borderColor="#00BCD4"
			paddingX={2}
			paddingY={1}
		>
			<Box>
				<Text color="#00BCD4" bold>
					🔍{' '}
				</Text>
				<TextInput value={query} onChange={setQuery} placeholder="Search..." />
			</Box>
			{results.length > 0 && (
				<Box flexDirection="column" marginTop={1}>
					{results.map((node, i) => (
						<Box key={node.id} flexDirection="column">
							<Box>
								{i === selectedIndex ? (
									<Text color="#00BCD4" bold>
										▶{' '}
									</Text>
								) : (
									<Text> </Text>
								)}
								<Text
									bold={i === selectedIndex}
									color={i === selectedIndex ? '#00BCD4' : 'white'}
								>
									{node.path}
								</Text>
							</Box>
							{node.schema.description && (
								<Box marginLeft={2}>
									<Text dimColor>
										{node.schema.description.length > 60
											? node.schema.description.slice(0, 57) + '...'
											: node.schema.description}
									</Text>
								</Box>
							)}
						</Box>
					))}
				</Box>
			)}
			{query && results.length === 0 && (
				<Box marginTop={1}>
					<Text dimColor>No results found</Text>
				</Box>
			)}
			<Box marginTop={1} borderTop borderColor="gray">
				<Text dimColor>
					<Text color="#00BCD4">⏎</Text> jump <Text color="gray">│</Text>{' '}
					<Text color="#00BCD4">Esc</Text> cancel <Text color="gray">│</Text>{' '}
					<Text color="#00BCD4">↑↓</Text> navigate
				</Text>
			</Box>
		</Box>
	);
}
