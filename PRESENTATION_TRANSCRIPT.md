## Slide 1 Cover Slide
- Title: Find me a bike - LA Metro Bike Share Data Visualization
- Group name: Tribe
- Members: Hsin-Yu Chang(hsinyuch@usc.edu), Ming-Yi Lin(linmingy@usc.edu), Zhao-Yang Song(zhaoyans@usc.edu)

## Slide 2 Intro

- 1O words: A map-based visualization to help shareholders analyze bike usage performance.

## Slide 3,4 Intro: Who is it addressed to, Why it is interesting, original and useful

- Audience: LA metro share bike Shareholders.

- Clean and straightforward: We use a black background LA map as the homepage. Users will get overwhelmed if we showing them text, data, and charts right away. Instead, we create an interactive roadmap to encourage users to deep into the insight themself. 

- We follow the data analysis logic to help users to find and solve their problem easily: 

The green dots represent "how many bikes in the dock" to help 
shareholders get an overall concept of the usages in each station right away. ==> Then there is a scattered network showing the top 5 destinations after hovering the station dot. ==> Users can learn more about this one special station on the dashboard right side. ==> Users can dive into a big-picture analysis on our "Analysis" page where we provide insights about passholder type, ride duration and bike type analysis by years.

## Slide 5 Who did what

- Hsin-Yu Chang: Data analysis and charts including Hourly Line Chart, Welcome page, Usage Growth Chart, etc.
- Ming-Yi Lin: Implementing Angular framework, Homepage map, Destinations Charts, Analysis Charts, etc.
- Zhao-Yang Song: Map-based charts including yearly performance, etc.


## Slide 6 Data
- We retrieved data from the LA Bikeshare Metro Website (https://bikeshare.metro.net/about/data/). 
- This is the major dataset we use is [Trip Data]. The data has been refined according to years. We select the trip data from 2017 Q1 to 2019 Q4. 
- To generate the map, we also link two other datasets: [Station Table] and [Station Status].
 

## Slide 7,8 Research
- Our research was mainly focussed on understanding the already existing visualizations on LA Metro Bikeshare performance and digging into the aspects that we wanted to improve on such that the shareholders can make a quick and informed decision on the bike renew system or other business strategies.
- LA Bike Data Analysis, LA Bike Data Official, NYC citi bike


## Slide 6 7 8  How your work is original

-
- 
-
-


## Slide 9 Design timeline
- Ideation, Dataset, UI Mockup, front end, back end, publishing, feedback and development. We have accomplished the project in 5 phases. 

First we ideated wherein we thought about what to implement and where to get the data from. 

Then we planned what all visualizations to use, based on researching already existing systems and visualizations. 

In the third phase we implemented the front end first and then the back end. 

In the 4th phase we published our project and rendering feedback forms. 

In the last phase tried to improve the system based on the feedbacks acquired.

## Slide ? Design Consideration
- Cairo wheel: we followed the cairo wheel to maintain balance between all functionalities such as unidimensionality and multidimensionality, abstraction and figuration.

## Slide ? Color Scheme
- We have used blue color throughout our project so that it would address colour blind people as well. D3 scaleLinear and scaleOrdinal have been used for the visualizations.

## Slide ? D3 Usage: Maps

## Slide ? Responsive
- The webiste is responsive and can be accessible from any device.

## Slide 14 Technologies Usage 
- We used different web technologies to build our project : 
    - `Bootstrap` is used to construct our application's responsive layout, which allows our website can automatically adjust the layout based on different screen dimension
    - `d3` is used to render our statistic charts and LA map
    - `mapbox` is mainly used to show our bike station locations
    - `python` to process our LA metro bike data in order to support rendering different type of charts in different formats 

## Slide 15 Map that shows all bike stations
- In this chart, we implemented a map that shows all the bike stations. Each circle also represents the available bikes in each station. 

## Slide 16 Bike station shows top 5 destinations and Total trips by Hour of the Day
- When users hovers on the station, the right side panel will automatically shows
    - Top 5 Destinations (bar chart)
        - Shows top 5 destinations that people head to from the current station
    - Total trips by hour of the current station
        - Shows the total number of trips hourly of the current station (line series chart)
- Both Charts are :
    - implemented by `d3.js`
    - it will automatically adjust the size based on the screen size (responsive chart)
    - it support well visual queries : `year`, `sort by station`, and `sort by times` (interactive chart)
    - it animates the chart when data changes (d3 animated transitions)

## Slide 17 Ride Duration By Passholder Type
- The chart shows the average ride duration of each passholder type, which includes `Flex Pass`, `Monthly Pass`, `Walk-up`, `One Day Pass` and `Annual Pass`.
- People who hold `Monthly Pass` tend to ride the bikes for about 10 - 20 minutes on average
- People who hold `One Dday Pass` tend to ride the bikes about 40 - 90 minutes on average
- People who hold `

## Slide 18 Bike Type Usage Growth

## Slide 19 Bike Station Inbound and Outbound

## Slide 20 Explain what you would have done differently.
- If we have more time, 

## Slide 15 - 19 Highlight what you have built and with d3 (see Demonstration for a list of required d3 features to include) and other tools including Bootstrap and framework features you used.
- d3 maps
- responsive d3 charts, interactive d3 charts, d3 animated transitions and 
- d3 layouts




