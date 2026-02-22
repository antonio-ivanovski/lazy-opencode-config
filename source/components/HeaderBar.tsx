import React from 'react';
import {Box, Text} from 'ink';
import {useConfig} from '../hooks/useConfig.js';

export default function HeaderBar() {
	const {activeScope, filePath, isDirty, projectExists} = useConfig();

	return (
		<Box flexDirection="column">
			<Box paddingX={1}>
				<Text color="#00BCD4" bold>
					┏━ lazy-opencode-config
					━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
				</Text>
			</Box>
			<Box paddingX={1} justifyContent="space-between">
				<Box>
					<Text color="#00BCD4">┃ </Text>
					{/* Active scope with filled circle */}
					<Text
						color={activeScope === 'global' ? '#00BCD4' : undefined}
						bold={activeScope === 'global'}
						dimColor={activeScope !== 'global'}
					>
						{activeScope === 'global' ? '◉' : '○'} Global
					</Text>
					<Text> </Text>
					<Text
						color={activeScope === 'project' ? '#00BCD4' : undefined}
						bold={activeScope === 'project'}
						dimColor={activeScope !== 'project'}
					>
						{activeScope === 'project' ? '◉' : '○'} Project
						{!projectExists && ' (new)'}
					</Text>
				</Box>
				<Box>
					<Text dimColor>{filePath}</Text>
					{isDirty && <Text color="#FF9800"> [mod]</Text>}
					<Text color="#00BCD4"> ┃</Text>
				</Box>
			</Box>
			<Box paddingX={1}>
				<Text color="#00BCD4">
					┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
				</Text>
			</Box>
		</Box>
	);
}
