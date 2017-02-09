
var CentroidBased = {}
var cb = CentroidBased;

cb.createClusters = function(depot, items, robotCapacity)
{
    var unclusteredVertices = [];

    for(var i = 0; i < items.length; i++)
    {
        unclusteredVertices.push(
        {
            item: items[i],
            distanceDepot: aStar.searchUnrestricted(items[i], depot)
        });
    }

    unclusteredVertices.sort(function(vertexA, vertexB)
    {
        return vertexA.distanceDepot - vertexB.distanceDepot;
    });

    var clusters = []
    var currentCluster = null;

    while(unclusteredVertices.length > 0)
    {
        if(currentCluster == null)
        {
            currentCluster = 
            {
                items: [unclusteredVertices[0].item],
                center: {
                    x: unclusteredVertices[0].item.x,
                    y: unclusteredVertices[0].item.y
                },
                weight: unclusteredVertices[0].item.weight
            }

            clusters.push(currentCluster);

            unclusteredVertices.splice(0, 1);
            continue;
        }

        var minVertexIndex = null;
        var minVertexDistance = Number.MAX_VALUE;
        for(var i = 0; i < unclusteredVertices.length; i++)
        {
            if(unclusteredVertices[i].item.weight + currentCluster.weight <= robotCapacity)
            {
                var distance = aStar.searchUnrestricted(currentCluster.center, unclusteredVertices[i].item).cost;

                if(distance < minVertexDistance)
                {
                    minVertexIndex = i;
                    minVertexDistance = distance;
                }
            }
        }

        if(minVertexIndex != null)
        {
            var vertex = unclusteredVertices[minVertexIndex];

            cb.addItemToCluster(currentCluster, vertex.item);

            unclusteredVertices.splice(minVertexIndex, 1);
        }
        else
        {
            currentCluster = null;
        }
    }

    for(var i = 0; i < clusters.length; i++)
    {
        for(var j = 0; j < clusters[i].items.length; j++)
        {
            clusters[i].items[j].centerDistance = aStar.searchUnrestricted(clusters[i].center, clusters[i].items[j]).cost;
        }
    }

    return clusters;
}

cb.addItemToCluster = function(cluster, item)
{
    cluster.items.push(item);
    cluster.weight += item.weight;
    cb.updateClusterCentre(cluster);
}

cb.removeItemFromCluster = function(cluster, item)
{
    var index = cluster.items.indexOf(item);
    cluter.items.splice(index, 1);
    cluster.weight -= item.weight;
    cb.updateClusterCentre(cluster);
}

cb.updateClusterCentre = function(cluster)
{
    var x = 0, y = 0;
    for(var i = 0; i < cluster.items.length; i++)
    {
        x += cluster.items[i].x;
        y += cluster.items[i].y;
    }

    cluster.center.x = Math.floor(x / cluster.items.length);
    cluster.center.y = Math.floor(y / cluster.items.length);
}

cb.adjustClusters = function(clusters, robotCapacity)
{
    var adjustmentsMade = false;

    for(var i = 0; i < clusters.length; i++)
    {
        var clusterItems = clusters[i].items;

        for(var k = 0; k < clusterItems.length; k++)
        {
            for(var j = 0; j < clusters.length; j++)
            {
                if(i == j)
                {
                    continue;
                }

                if(clusters[j].weight + clusterItems[k].weight < robotCapacity)
                {
                    var distance = aStar.searchUnrestricted(clusters[j].center, clusterItems[k]).cost;

                    if(distance < clusterItems[k].centerDistance)
                    {
                        adjustmentsMade = true;

                        cb.removeItemFromCluster(clusters[i], clusterItems[k]);
                        cb.addItemToCluster(clusters[j], clusterItems[k]);
                    }
                }
            }
        }
    }

    return adjustmentsMade;
}

// A Centroid-Based Heuristic Algorithm For The Capacitated Vehicle Routing Problem
cb.calculate = function(depot, items, robotCapacity, tspAlgorithm)
{
    console.log(tspAlgorithm);
    var clusters = cb.createClusters(depot, items, robotCapacity);
    while(cb.adjustClusters(clusters))
    {
        console.log("loop");
    }

    for(var i = 0; i < clusters.length; i++)
    {
        for(var j = 0; j < clusters[i].items.length; j++)
        {
            delete clusters[i].items[j].centerDistance;
        }

        clusters[i].items = tspAlgorithm(depot, clusters[i].items);
    }

    return clusters; // assignments
}


vrp.cb = cb.calculate;