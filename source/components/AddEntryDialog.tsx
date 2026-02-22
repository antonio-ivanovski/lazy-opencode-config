import React, {useState} from 'react';
import {Box, Text, useInput} from 'ink';
import TextInput from 'ink-text-input';

type Props = {
	parentPath: string; // e.g., "agent", "mcp", "command"
	parentLabel: string; // e.g., "agent", "MCP server", "command"
	existingKeys: string[]; // keys already present, to prevent duplicates
	onConfirm: (key: string) => void;
	onCancel: () => void;
};

export default function AddEntryDialog({
	parentLabel,
	existingKeys,
	onConfirm,
	onCancel,
}: Props) {
	const [keyName, setKeyName] = useState('');
	const [error, setError] = useState<string | null>(null);

	useInput((_input, key) => {
		if (key.escape) onCancel();
	});

	const handleSubmit = (val: string) => {
		const trimmed = val.trim();
		if (!trimmed) {
			setError('Name cannot be empty');
			return;
		}
		if (existingKeys.includes(trimmed)) {
			setError(`"${trimmed}" already exists`);
			return;
		}
		if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
			setError('Only letters, numbers, hyphens, underscores');
			return;
		}
		onConfirm(trimmed);
	};

	return (
		<Box
			flexDirection="column"
			borderStyle="round"
			borderColor="#00BCD4"
			paddingX={2}
			paddingY={1}
		>
			<Text bold color="#00BCD4">
				➕ Add new {parentLabel}
			</Text>
			<Text> </Text>
			<Box>
				<Text dimColor>Name: </Text>
				<TextInput
					value={keyName}
					onChange={v => {
						setKeyName(v);
						setError(null);
					}}
					onSubmit={handleSubmit}
				/>
			</Box>
			{error && <Text color="#F44336">✗ {error}</Text>}
			<Text> </Text>
			<Text dimColor>
				<Text color="#00BCD4">⏎</Text> confirm <Text color="gray">│</Text>{' '}
				<Text color="#00BCD4">Esc</Text> cancel
			</Text>
		</Box>
	);
}
