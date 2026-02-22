import React from 'react';
import {Box, Text} from 'ink';

type Props = {
	mode: 'browse' | 'edit' | 'search';
	errorCount: number;
	warningCount: number;
};

export default function StatusBar({mode, errorCount, warningCount}: Props) {
	const hints = {
		browse: (
			<>
				<Text color="#00BCD4">↑↓</Text>
				<Text dimColor> move </Text>
				<Text color="gray">│</Text>
				<Text dimColor> </Text>
				<Text color="#00BCD4">⏎</Text>
				<Text dimColor> edit </Text>
				<Text color="gray">│</Text>
				<Text dimColor> </Text>
				<Text color="#00BCD4">a</Text>
				<Text dimColor> add </Text>
				<Text color="gray">│</Text>
				<Text dimColor> </Text>
				<Text color="#00BCD4">d</Text>
				<Text dimColor> del </Text>
				<Text color="gray">│</Text>
				<Text dimColor> </Text>
				<Text color="#00BCD4">/</Text>
				<Text dimColor> find </Text>
				<Text color="gray">│</Text>
				<Text dimColor> </Text>
				<Text color="#00BCD4">s</Text>
				<Text dimColor> save </Text>
				<Text color="gray">│</Text>
				<Text dimColor> </Text>
				<Text color="#00BCD4">?</Text>
			</>
		),
		edit: (
			<>
				<Text color="#00BCD4">⏎</Text>
				<Text dimColor> confirm </Text>
				<Text color="gray">│</Text>
				<Text dimColor> </Text>
				<Text color="#00BCD4">Esc</Text>
				<Text dimColor> cancel</Text>
			</>
		),
		search: (
			<>
				<Text color="#00BCD4">⏎</Text>
				<Text dimColor> jump </Text>
				<Text color="gray">│</Text>
				<Text dimColor> </Text>
				<Text color="#00BCD4">Esc</Text>
				<Text dimColor> clear </Text>
				<Text color="gray">│</Text>
				<Text dimColor> </Text>
				<Text color="#00BCD4">↑↓</Text>
				<Text dimColor> navigate</Text>
			</>
		),
	};

	let validationText = '';
	let validationColor = '#4CAF50';
	if (errorCount > 0) {
		validationText = `✗ ${errorCount} error${errorCount > 1 ? 's' : ''}`;
		validationColor = '#F44336';
	} else {
		validationText = '✓ valid';
	}

	if (warningCount > 0) {
		validationText += `  ⚠ ${warningCount} warning${
			warningCount > 1 ? 's' : ''
		}`;
	}

	return (
		<Box flexDirection="column">
			<Box paddingX={1}>
				<Text color="gray">
					━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
				</Text>
			</Box>
			<Box paddingX={1} justifyContent="space-between">
				<Box>{hints[mode]}</Box>
				<Text color={validationColor}>{validationText}</Text>
			</Box>
		</Box>
	);
}
