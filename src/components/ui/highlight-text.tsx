import React, { type JSX } from "react";
import { cn } from "@/lib/utils";

interface HighlightTextProps {
	/**
	 * The text content to search and highlight within
	 */
	text: string;

	/**
	 * Array of terms to highlight in the text
	 */
	highlightTerms: string[];

	/**
	 * Custom CSS class for the container element
	 */
	className?: string;

	/**
	 * Custom CSS class for highlighted text spans
	 */
	highlightClassName?: string;

	/**
	 * Whether the search should be case sensitive
	 * @default false
	 */
	caseSensitive?: boolean;

	/**
	 * Whether to highlight whole words only
	 * @default false
	 */
	wholeWordsOnly?: boolean;

	/**
	 * HTML element to render as container
	 * @default 'span'
	 */
	as?: keyof JSX.IntrinsicElements;
}

/**
 * HighlightText Component
 *
 * A reusable component that highlights specified search terms within text content.
 * Supports multiple highlight terms, case sensitivity options, and customizable styling.
 *
 * @example
 * ```tsx
 * <HighlightText
 *   text="Fleet management made simple"
 *   highlightTerms={["Fleet", "simple"]}
 *   highlightClassName="bg-yellow-200 text-yellow-900"
 * />
 * ```
 */
export const HighlightText: React.FC<HighlightTextProps> = ({
	text,
	highlightTerms,
	className,
	highlightClassName = "bg-yellow-200 text-yellow-900 px-0.5 rounded-sm",
	caseSensitive = false,
	wholeWordsOnly = false,
	as: Component = "span",
}) => {
	// Filter out empty terms and prepare for regex
	const validTerms = highlightTerms.filter(
		(term) => term && term.trim().length > 0
	);

	// If no valid terms, return original text
	if (validTerms.length === 0) {
		return React.createElement(Component, { className }, text);
	}

	// Escape special regex characters in search terms
	const escapeRegex = (str: string): string => {
		return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	};

	// Build regex pattern for highlighting
	const buildPattern = (): RegExp => {
		const escapedTerms = validTerms.map(escapeRegex);

		let pattern: string;
		if (wholeWordsOnly) {
			// Match whole words only using word boundaries
			pattern = `\\b(${escapedTerms.join("|")})\\b`;
		} else {
			// Match partial words
			pattern = `(${escapedTerms.join("|")})`;
		}

		const flags = caseSensitive ? "g" : "gi";
		return new RegExp(pattern, flags);
	};

	// Split text and highlight matches
	const highlightText = (): React.ReactNode[] => {
		const regex = buildPattern();
		const parts: React.ReactNode[] = [];
		let lastIndex = 0;

		// Find all matches and split text accordingly
		let match = regex.exec(text);
		while (match !== null) {
			const matchStart = match.index;
			const matchEnd = regex.lastIndex;

			// Add text before match (if any)
			if (matchStart > lastIndex) {
				parts.push(text.slice(lastIndex, matchStart));
			}

			// Add highlighted match
			parts.push(
				<span
					className={cn(highlightClassName)}
					key={`highlight-${matchStart}-${matchEnd}`}
				>
					{match[0]}
				</span>
			);

			lastIndex = matchEnd;

			// Prevent infinite loop on zero-length matches
			if (match.index === regex.lastIndex) {
				regex.lastIndex++;
			}

			// Get next match
			match = regex.exec(text);
		}

		// Add remaining text after last match
		if (lastIndex < text.length) {
			parts.push(text.slice(lastIndex));
		}

		return parts;
	};

	const highlightedContent = highlightText();

	return React.createElement(
		Component,
		{ className: cn(className) },
		...highlightedContent
	);
};

// Export default for convenience
export default HighlightText;
