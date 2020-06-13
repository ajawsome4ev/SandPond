//============//
// Javascript //
//============//
const JAVASCRIPT = {}

{
	// Javascript Job Description
	//===========================
	// "I generate Javascript for an element's 'behave' function."

	//========//
	// Public //
	//========//
	JAVASCRIPT.makeBehaveCode = (instructions, name) => {
		return makeBehaveCode(instructions, name)
	}
	
	show = (element) => {
		print(element.name)
		for (const instruction of element.instructions) print(instruction.type, instruction.value)
	}
	
	// messy as hell
	JAVASCRIPT.makeConstructorCode = (name, data, args) => {
	
		let closureArgNames = ``
		let constructorArgNames = ``
		let propertyNames = ``
	
		for (const argName in data) {
			if (closureArgNames.length == 0) {
				closureArgNames += `${argName}Default`
				propertyNames += `,\n ${argName}: ${argName}Default`
			}
			else {
				closureArgNames += `, ${argName}Default`
				propertyNames += `, ${argName}: ${argName}Default`
			}
		}
		
		for (const argName in args) {
			if (closureArgNames.length == 0) {
				closureArgNames += `${argName}Default`
			}
			else {
				closureArgNames += `, ${argName}Default`
			}
			if (constructorArgNames.length == 0) {
				constructorArgNames += `${argName} = ${argName}Default`
				propertyNames += `, ${argName}: ${argName}`
			}
			else {
				constructorArgNames += `${argName} = ${argName}Default`
				propertyNames += `, ${argName}: ${argName}`
			}
		}
	
		return (`(${closureArgNames}) => {\n` +
		`\n`+
		`const element = function ${name}(${constructorArgNames}) {\n`+
		`	const atom = {element, visible: element.visible, colour: element.shaderColour, emissive: element.shaderEmissive, opacity: element.shaderOpacity${propertyNames}}\n`+
		`	return atom\n`+
		`}\n`+
		`	return element\n`+
		`}`)
	}
	
	//==========//
	// Template //
	//==========//
	JAVASCRIPT.makeEmptyTemplate = () => ({
	
		// Head contains stores of global functions that we need
		head: {
			given: [],
			change: [],
			keep: [],
			behave: [],
		},
		
		// Cache stores global variables that we might use more than once
		cache: [],
		
		// 
		symmetry: [],
		
		// Main is an array of stuff that happens in order
		// Strings just get naively added to the code
		// Chunk objects specify more fancy stuff
		main: [
			
		],
	})
	
	const buildTemplate = (template) => {
		
		const lines = []
		
		// HEAD
		lines.push("//======//")
		lines.push("// HEAD //")
		lines.push("//======//")
		for (const storeName in template.head) {
			const store = template.head[storeName]
			for (let i = 0; i < store.length; i++) {
				const script = store[i]
				if (script === undefined) continue
				if (script.split("\n").length > 1) lines.push(``)
				lines.push(`const ${storeName}${i} = ${script}`)
				if (script.split("\n").length > 1) lines.push(``)
			}
		}
		lines.push("")
		
		// MAIN
		lines.push("//======//")
		lines.push("// MAIN //")
		lines.push("//======//")
		lines.push(`const behave = (origin, selfElement, time, self = selfElement.atom) => {`)
		const [startLines, endLines] = makeChunksLines(template.main, `	`, [])
		
		lines.push(...startLines)
		lines.push(...endLines.reversed)
		
		lines.push(`}`)
		lines.push(``)
		lines.push(`return behave`)
		
		const code = lines.join("\n")
		return code
	}
	
	const makeChunksLines = (chunks, margin, alreadyGots) => {
		const startLines = []
		const endLines = []
		for (let i = 0; i < chunks.length; i++) {
			const chunk = chunks[i]
			startLines.push(``)
			//startLines.push(`${margin}// Diagram`)
			if (chunk.is(String)) {
				startLines.push(`${margin}` + chunk)
				continue
			}
			
			for (const needer of chunk.input.needers) {
				startLines.push(...makeNeederLines(needer, `${margin}`, alreadyGots, true))
			}
			
			const conditionInnerCode = chunk.conditions.join(" && ")
			if (chunk.conditions.length === 0) startLines.push(`	{`)
			else startLines.push(`${margin}if (!(${conditionInnerCode})) {`)
			
			const diagramEndLines = []
			
			diagramEndLines.push(`${margin}	return`)
			diagramEndLines.push(`${margin}}`)
			const afterAlreadyGots = [...alreadyGots]
			for (const needer of chunk.output.needers) {
				diagramEndLines.push(...makeNeederLines(needer, `${margin}`, afterAlreadyGots, true))
			}
			
			// Do other diagrams after this action
			if (chunk.isInAction) {
				const tail = chunks.slice(i+1).filter(c => c.actionId !== chunk.actionId)
				const [afterStartLines, afterEndLines] = makeChunksLines(tail, margin, afterAlreadyGots)
				diagramEndLines.push(...afterStartLines)
				diagramEndLines.push(...afterEndLines.reversed)
			}
			
			// Do actions after this non-action diagram
			else {
				const tail = chunks.slice(i+1)
				const tailActions = tail.filter(chunk => chunk.isInAction)
				if (tailActions[0] !== undefined) {
					const [afterStartLines, afterEndLines] = makeChunksLines(tailActions, margin, afterAlreadyGots)
					diagramEndLines.push(...afterStartLines)
					diagramEndLines.push(...afterEndLines.reversed)
				}
			}
			
			endLines.push(...diagramEndLines.reversed)
			margin += `	`
		}
		return [startLines, endLines]
	}
	
	const makeNeederLines = (needer, indent, alreadyGots, cache = true) => {
		const lines = []
		const need = needer.need
		if (need.generateGet && !alreadyGots.includes(needer.name)) {
			const getCode = need.generateGet(needer.x, needer.y, needer.z, needer.symmetry, needer.symmetryId, needer.id, needer.argNames, needer.idResultName, needer.symmetry)
			if (getCode !== undefined) lines.push(`${indent}const ${needer.name} = ${getCode}`)
			if (cache) alreadyGots.push(needer.name)
		}
		if (need.generateExtra) {
			const extraCode = need.generateExtra(needer.x, needer.y, needer.z, needer.symmetry, needer.symmetryId, needer.id, needer.argNames, needer.idResultName)
			if (extraCode !== undefined) lines.push(`${indent}${extraCode}`)
		}
		return lines
	}
	
	//========//
	// Behave //
	//========//
	const makeBehaveCode = (instructions, name) => {
	
		let template = JAVASCRIPT.makeEmptyTemplate()
		
		const blockStart = {type: INSTRUCTION.TYPE.NAKED}
		const blockEnd = {type: INSTRUCTION.TYPE.BLOCK_END}
		const fullInstructions = [blockStart, ...instructions, blockEnd]
	
		for (let i = 0; i < fullInstructions.length; i++) {
			const instruction = fullInstructions[i]
			const type = instruction.type
			const value = instruction.value
			const tail = fullInstructions.slice(i+1)
			const jumps = type.generate(template, value, tail)
			if (jumps !== undefined) i += jumps
		}
		
		//if (name == "_Sand") print(template)
	
		const code = buildTemplate(template)
		if (name == "_Sand") print(code)
		return code
	}
	
	const indentInnerCode = (code) => {
		const lines = code.split("\n")
		const indentedLines = lines.map((line, i) => (i == 0 || i >= lines.length-2)? line : `	${line}`)
		const indentedCode = indentedLines.join("\n")
		return indentedCode
	}
	
	const ALPHABET = "abcdefghijklmnopqrstuvwxyz"
	
	
	
}


