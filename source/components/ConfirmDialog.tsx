import React from 'react';
import {Box, Text, useInput} from 'ink';

type Props = {
	message: string;
	onSave: () => void;
	onDiscard: () => void;
	onCancel: () => void;
};

export default function ConfirmDialog({
	message,
	onSave,
	onDiscard,
	onCancel,
}: Props) {
	useInput((input, key) => {
		if (input === 'y' || input === 'Y') onSave();
		if (input === 'n' || input === 'N') onDiscard();
		if (input === 'c' || input === 'C' || key.escape) onCancel();
	});

	return (
		<Box
			flexDirection="column"
			borderStyle="round"
			borderColor="#FF9800"
			paddingX={3}
			paddingY={1}
		>
			<Text color="#FF9800" bold>
				⚠ {message}
			</Text>
			<Text> </Text>
			<Box>
				<Text color="#00BCD4" bold>
					[Y]
				</Text>
				<Text dimColor>es — Save and quit</Text>
			</Box>
			<Box>
				<Text color="#00BCD4" bold>
					[N]
				</Text>
				<Text dimColor>o — Discard and quit</Text>
			</Box>
			<Box>
				<Text color="#00BCD4" bold>
					[C]
				</Text>
				<Text dimColor>ancel — Go back</Text>
			</Box>
		</Box>
	);
}
