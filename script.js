//These variables are used to keep track of the sorting of the table
sortingIndex=-1
sortingArrowIndex=-1
sortingDescending=false

//userAttributes holds the data for active users, which is used to fill the table
userAttributes=[]

//This function empties the table, if it isn't already empty, and then fills it based on
//userAttributes. Each time userAttributes is changed (such as when the user changes the 
//sorting method), this function should be called to update the table.
function fillTable()
{
	//Find the table in the DOM by its ID
	table=document.getElementById("userTable")

	//Remove all rows but the first from the table
	while (table.rows.length>1)
	{
		table.deleteRow(-1)
	}

	//Add rows for each user, in the order they are listed in userAttributes
	for (i=0;i<userAttributes.length;i++)
	{
		attributes=userAttributes[i]

		//Create the HTML text for the new row
		newRow="<tr>"
		//Add the first three attributes (id, name, and created_at) to the row
		for (i2=0;i2<3;i2++)
		{
			newRow+="<td>"+attributes[i2]+"</td>"
		}
		//The last attribute, average score, will display additional stats when hovered.
		//To accomplish this, the text is placed in a div with a class that has special
		//properties from the CSS
		newRow+="<td><div class=\"hoverable\">"+attributes[3]+ //This is just the average score, displayed normally in the table
		"<p class=\"hoverText\">"+attributes[4]+" scores"+ //The following lines only show up upon hovering
		"<br>Standard deviation: "+attributes[5]+
		"<br>Max score: "+attributes[6]+
		"<br>Min score: "+attributes[7]+"</p></div></td>"

		//Close the row
		newRow+="</tr>"

		//Add the newly created HTML after the last row in the userTable
		$("#userTable tr:last").after(newRow)
	}
}

//This function places an arrow describing the direction of sorting on the relevant
//column(as well as removing the old arrow, if necessary).
function updateSortArrow()
{
	if (sortingArrowIndex>=0)
	{
		oldHeader=document.getElementById("colHead"+String(sortingArrowIndex))
		oldHeader.innerHTML=oldHeader.innerHTML.substring(0,oldHeader.innerHTML.length-2)
	}
	sortingArrowIndex=sortingIndex

	newHeader=document.getElementById("colHead"+String(sortingArrowIndex))

	newHeader.innerHTML+=" "+(sortingDescending?"▲":"▼")
}

//This function edits userAttributes such that it is sorted by the specified attribute, 
//then refills the table.
function sortBy(index)
{
	//Use the built-in sort function with a compare function argument to sort the list by
	//the relevant attribute.
	userAttributes.sort(function(a, b) {
		attributeA=a[index]
		attributeB=b[index]
		if (attributeA==attributeB)
		{
			return 0
		}
		else if(attributeA<attributeB)
		{
			return -1
		}
		else
		{
			return 1
		}
	})

	//If the index is the same as the last index used to sort, switch the direction.
	if (index==sortingIndex)
	{
		sortingDescending=!sortingDescending
	}
	//Otherwise, set sortingIndex to the supplied index to keep track for the next time
	//this function is called. Sort ascending by default.
	else
	{
		sortingIndex=index
		sortingDescending=false
	}

	//If the index is to be sorted in descending order, reverse the order (since the sort
	//function used before always does ascending)
	if (sortingDescending)
	{
		userAttributes.reverse()
	}

	//Finally, refill the table using the newly updated userAttributes, and update the
	//position of the arrow in the column headers that indicates the current sorting mode
	fillTable()
	updateSortArrow()
}

//This call loads the data from the seed_data.json file, and uses it to popualte the userAttributes table
$.getJSON("./seed_data.json", function(data) {
	//userScores is a dictionary used to keep organizes of the scores  by the user that they belong to
	userScores={}
	for (i=0;i<data.scores.length;i++)
	{
		userId=data.scores[i].user_id
		if (!(userId in userScores))
		{
			userScores[userId]=[]
		}
		userScores[userId].push(data.scores[i].score)
	}

	//Itterate over users, adding the data to userAttributes if they are active
	for (i=0;i<data.users.length;i++)
	{
		user=data.users[i]

		//Only add users where active is set to true, and ignore the rest
		if(user.active=="true")
		{
			//Extract the user's basic attributes from the data (id, name, and creation time)
			userId=user.id
			username=user.name
			userCreatedAt=user.created_at

			userScoreCount=userScores[userId].length

			//Use the userScores dictionary to compute the average score for this user
			userScoreSum=0
			for (i2=0;i2<userScoreCount;i2++)
			{
				userScoreSum+=userScores[userId][i2]
			}
			userScoreAverage=(userScoreSum/userScoreCount).toFixed(2)

			//Additionally, calculate the variance of the scores
			userScoreVarianceSum=0
			for (i2=0;i2<userScoreCount;i2++)
			{
				diff=userScores[userId][i2]-userScoreAverage
				userScoreVarianceSum+=diff*diff
			}
			userScoreVariance=userScoreVarianceSum/userScoreCount
			userScoreStandardDeviation=Math.sqrt(userScoreVariance).toFixed(2)

			//Finally, find the user's maximum and minimum scores
			userScoreMax=Number.MIN_SAFE_INTEGER
			userScoreMin=Number.MAX_SAFE_INTEGER
			for (i2=0;i2<userScoreCount;i2++)
			{
				score=userScores[userId][i2]
				if (score>userScoreMax)
				{
					userScoreMax=score
				}
				if(score<userScoreMin)
				{
					userScoreMin=score
				}
			}

			//Add an array containing all the relevant attributes for this user to userAttributes
			userAttributes.push([userId,username,userCreatedAt,userScoreAverage,userScoreCount,userScoreStandardDeviation,userScoreMax,userScoreMin])
		}
	}

	//Sort User's by id (their first attribute) to start
	sortBy(0)
})