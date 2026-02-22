export type SchemaNode = {
	type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'enum' | 'mixed';
	description?: string;
	default?: unknown;
	enumValues?: string[];
	deprecated?: boolean;
	deprecatedMessage?: string;
	minimum?: number;
	maximum?: number;
	properties?: Record<string, SchemaNode>;
	additionalProperties?: SchemaNode | boolean;
	items?: SchemaNode;
	format?: string;
	// For anyOf/oneOf unions that contain object variants
	anyOfVariants?: SchemaNode[];
	// For pattern-validated strings (like hex color)
	pattern?: string;
};
