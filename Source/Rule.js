//======//
// Rule //
//======//
const RULE = {}


{
	
	// Rule Job Description
	//=======================
	// "I describe how an atom behaves."
	
	//========//
	// Public //
	//========//
	// iterations
	// - iteration0
	// - iteration1
	// - ...
	// - iteration47
	
	// iteration
	// - reflection0
	// - reflection1
	// - ...
	// - reflection47
	
	// reflection
	// - event0
	// - event1
	// - ...
	// - eventN
	
	// event
	// - siteNumber
	// - input
	// - output
	
	RULE.make = (rawDiagram, oneSymmetries = "", allSymmetries = "", isAction = false, forSymmetries = "") => {
	
		if (oneSymmetries != "" && forSymmetries != "") throw new Error("[TodeSplat] You can't combine a 'for' with a 'one' because I find it too confusing to code sorry.")
		
		const diagram = SYMMETRY.getAllDiagram(rawDiagram, allSymmetries)
		const forDiagrams = SYMMETRY.getSymmetryDiagrams(diagram, forSymmetries)
		const iterations = []
		
		let previousDiagram = undefined
		
		for (const forDiagram of forDiagrams) {
			if (!previousDiagram) {
				previousDiagram = forDiagram
			}
			else if (SYMMETRY.isDiagramEqual(forDiagram, previousDiagram)) {
				iterations.push(undefined)
				continue
			}
			previousDiagram = forDiagram
			const oneDiagrams = SYMMETRY.getSymmetryDiagrams(forDiagram, oneSymmetries)
			const eventLists = getEventLists(oneDiagrams)
			iterations.push(eventLists)
		}
		
		print(iterations)
		
		const rule = {
		
			//eventLists,
			isAction,
			iterations, 
			
		}
		
		return rule
	}
	
	//=========//
	// Private //
	//=========//
	const getEventLists = (spaceLists) => {
		const eventLists = spaceLists.map(spaces => {
			const events = spaces.map(space => EVENT.make(space))
			return events
		})
		return eventLists
	}
	
}
