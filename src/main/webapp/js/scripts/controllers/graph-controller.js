/**
 * @author Mateusz Kaproń
 * 31.03.17
 */
angular.module('aas').controller('graphController', [
	'$scope', 'rest',
	function ($scope, rest) {

		var w = (window.innerWidth - 60)*4;
		var h = window.innerHeight - 200;

		var newParent = null;
		var rootObjects = null;

		var margin = {top: 5, right: 50, bottom: 5, left: 100},
			width = w - margin.right - margin.left,
			height = h - margin.top - margin.bottom;

		var i = 0,
			duration = 750,
			root;

		var tree = d3.layout.tree()
			.size([height, width]);

		var diagonal = d3.svg.diagonal()
			.projection(function (d) {
				return [d.y, d.x];
			});

		var svg = d3.select("#d3-graph").append("svg")
			.attr("width", width + margin.right + margin.left)
			.attr("height", height + margin.top + margin.bottom)
			.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		// var inputGraph = '{"name": "flare","children": [{"name": "analytics","children": [{"name": "cluster","children": [{"name": "MergeEdge", "size": 10 }]}]}]}';


//Show only root and his children at the beginning
		function collapse(d) {
			if (d.children) {
				d._children = d.children;
				d._children.forEach(collapse);
				d.children = null;
			}
		}

		$scope.drawGraph = function () {
			var inputText = document.getElementById('inputText').innerHTML.replace('&nbsp;', '').replace('<br>', '');
			console.log(inputText);
			console.log(inputText.trim());
			var inputArray = inputText.split(" ");
			var inputJSON = {};
			inputJSON.name = inputText;
			rootObjects = {};
			rootObjects.name = inputText;

			// for (var i = 0; i < inputArray.length; i++) {
			// 	var child = {};
			// 	var children = [];
			// 	if (inputJSON.name === null) {
			// 		rootObjects = inputJSON;
			// 		inputJSON.name = inputArray[i];
			// 	} else {
			// 		child.name = inputArray[i];
			// 		children.push(child);
			// 		inputJSON.children = children;
			// 		inputJSON = child;
			// 	}
			// 	if (i !== inputArray.length) {
			// 		inputJSON.children = null;
			// 	} else {
			//
			// 	}
			// }

			root = rootObjects;
			root.x0 = height / 2;
			root.y0 = 0;
			// root.children.forEach(collapse);
			update(root);
		};

		d3.select(self.frameElement).style("height", "800px");

		function update(source) {

			// Compute the new tree layout.
			var nodes = tree.nodes(root).reverse(),
				links = tree.links(nodes);

			// Normalize for fixed-depth.
			nodes.forEach(function (d) {
				d.y = d.depth * 180;
			});

			// Update the nodes…
			var node = svg.selectAll("g.node")
				.data(nodes, function (d) {
					return d.id || (d.id = ++i);
				});

			// Enter any new nodes at the parent's previous position.
			var nodeEnter = node.enter().append("g")
				.attr("class", "node")
				.attr("transform", function (d) {
					return "translate(" + source.y0 + "," + source.x0 + ")";
				})
				.on("click", click);

			nodeEnter.append("circle")
				.attr("r", 1e-6)
				.style("fill", function (d) {
					return d._children ? "lightsteelblue" : "#fff";
				});

			nodeEnter.append("text")
				.attr("x", function (d) {
					return d.children || d._children ? -10 : 10;
				})
				.attr("dy", ".35em")
				.attr("text-anchor", function (d) {
					return d.children || d._children ? "end" : "start";
				})
				.text(function (d) {
					var coeff = (d.coeff == null) ? '' : d.coeff;
					return d.name + coeff;
				})
				.style("fill-opacity", 1e-6);

			// Transition nodes to their new position.
			var nodeUpdate = node.transition()
				.duration(duration)
				.attr("transform", function (d) {
					return "translate(" + d.y + "," + d.x + ")";
				});

			nodeUpdate.select("circle")
				.attr("r", 4.5)
				.style("fill", function (d) {
					return d._children ? "lightsteelblue" : "#fff";
				});

			nodeUpdate.select("text")
				.style("fill-opacity", 1);

			// Transition exiting nodes to the parent's new position.
			var nodeExit = node.exit().transition()
				.duration(duration)
				.attr("transform", function (d) {
					return "translate(" + source.y + "," + source.x + ")";
				})
				.remove();

			nodeExit.select("circle")
				.attr("r", 1e-6);

			nodeExit.select("text")
				.style("fill-opacity", 1e-6);

			// Update the links…
			var link = svg.selectAll("path.link")
				.data(links, function (d) {
					return d.target.id;
				});

			// Enter any new links at the parent's previous position.
			link.enter().insert("path", "g")
				.attr("class", "link")
				.attr("d", function (d) {
					var o = {x: source.x0, y: source.y0};
					return diagonal({source: o, target: o});
				});

			// Transition links to their new position.
			link.transition()
				.duration(duration)
				.attr("d", diagonal);

			// Transition exiting nodes to the parent's new position.
			link.exit().transition()
				.duration(duration)
				.attr("d", function (d) {
					var o = {x: source.x, y: source.y};
					return diagonal({source: o, target: o});
				})
				.remove();

			// Stash the old positions for transition.
			nodes.forEach(function (d) {
				d.x0 = d.x;
				d.y0 = d.y;
			});
		}

		function click(d) {
			if (d.children) {
				d._children = d.children;
				d.children = null;
				update(d);
			} else {
				if (d._children) {
					d.children = d._children;
					d._children = null;
					update(d);
				} else {
					//Send request
					var currentObject = d;
					var words = [];
					while (currentObject.hasOwnProperty('parent')) {
						words.unshift(currentObject.name);
						// words = words + currentObject.name + ' ';
						currentObject = currentObject.parent;
					}
					words.unshift(rootObjects.name);
					var stringToSend = '';
					for (var i = 0; i < words.length ; i++) {
						stringToSend = stringToSend + words[i] + ' ';
					}
					stringToSend = stringToSend + " nbsp";
					console.log(stringToSend);
					newParent = d;
					$scope.nextWord(stringToSend, d);

					// d.children = newChildren;
					// console.log(5);
					// d._children = null;
					// console.log(6);
				}
			}
			// update(d);
		}

		$scope.nextWord = function (words, node) {
			$scope.startSpin();
			rest.nextWord(words + ' ', $scope.nextWordSuccess);
		};

		$scope.nextWordSuccess = function (data) {
			$scope.stopSpin();
			newParent.children = data;
			newParent._children = null;
			update(newParent);
		};

		// $scope.updateGraph = function updateGraph(data, node) {
		// 	console.log('11');
		// 	console.log(data);
		// 	console.log(node);
		// }

	}

// 	$scope.nextWord = function (word) {
// 		rest.nextWord(word + ' ', $scope.nextWordSuccess());
// 	};
//
// 	$scope.nextWordSuccess = function (data) {
// 		$scope.outputText = data;
// };

]);