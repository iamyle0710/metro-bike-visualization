## Slide 0 Cover Slide
- Title: Find me a bike - LA Metro Bike Share Data Visualization
- Group name: Tribe
- Members: Hsin-Yu Chang(hsinyuch@usc.edu), Ming-Yi Lin(linmingy@usc.edu), Zhao-Yang Song(zhaoyans@usc.edu)

## Slide 1 Intro

- 1O words: A map-based visualization to help shareholders analyze bike usage performance.

## Slide 2,3 Intro: Who is it addressed to, Why it is interesting, original and useful

- Audience: LA metro share bike Shareholders.

- Clean and straightforward: We use a black background LA map as the homepage. Users will get overwhelmed if we showing them text, data, and charts right away. Instead, we create an interactive roadmap to encourage users to deep into the insight themself. 

- We follow the data analysis logic to help users to find and solve their problem easily: 

The green dots represent "how many bikes in the dock" to help 
shareholders get an overall concept of the usages in each station right away. ==> Then there is a scattered network showing the top 5 destinations after hovering the station dot. ==> Users can learn more about this one special station on the dashboard right side. ==> Users can dive into a big-picture analysis on our "Analysis" page where we provide insights about passholder type, ride duration and bike type analysis by years.

## Slide 4 Who did what

- Hsin-Yu Chang: Data analysis and charts including Hourly Line Chart, Welcome page, Usage Growth Chart, etc.
- Ming-Yi Lin: Implementing Angular framework, Homepage map, Destinations Charts, Analysis Charts, etc.
- Zhao-Yang Song: Map-based charts including yearly performance, etc.


## Slide 5 Data
- We retrieved data from the LA Bikeshare Metro Website (https://bikeshare.metro.net/about/data/). 
- This is the major dataset we use is [Trip Data]. The data has been refined according to years. We select the trip data from 2017 Q1 to 2019 Q4. 
- To generate the map, we also link two other datasets: [Station Table] and [Station Status].
 

## Slide 6 Research
- Our research was mainly focussed on understanding the already existing visualizations on LA Metro Bikeshare performance and digging into the aspects that we wanted to improve on such that the shareholders can make a quick and informed decision on the bike renew system or other business strategies.
- LA Bike Data Analysis, LA Bike Data Official, NYC citi bike

## Slide 7 Explain how your work is original.
-
-
-

## Slide 8 Explain your design process, rationale for the layout, story, choice of forms, how you optimized the visual queries and user interaction
-
- 
-
-

## Slide 9 Highlight what you have built and with d3 and other tools you used
- Technologies Usage
    - `Bootstrap` is used to construct our application's responsive layout, which allows our website can automatically adjust the layout based on different screen dimension
    - `d3` is used to render our statistic charts and LA map
    - `mapbox` is mainly used to show our bike station locations
    - `python` to process our LA metro bike data in order to support rendering different type of charts in different formats 
- Bike station shows top 5 destinations and Total trips by Hour of the Day
    - When users hovers on the station, the right side panel will automatically shows
        - Top 5 Destinations (bar chart)
            - Shows top 5 destinations that people head to from the current station
        - Total trips by hour of the current station
            - Shows the total number of trips hourly of the current station (line series chart)
            - supply : total number of incoming bikes
            - demand : total number of outgoing bikes
    - Both Charts are :
        - implemented by `d3.js`
        - it will automatically adjust the size based on the screen size (responsive chart)
        - it support well visual queries : `year`, `sort by station`, and `sort by times` (interactive chart)
        - it animates the chart when data changes (d3 animated transitions)
- Ride Duration By Passholder Type
    - The chart shows the average ride duration of each passholder type, which includes `Flex Pass`, `Monthly Pass`, `Walk-up`, `One Day Pass` and `Annual Pass`.
    - People who hold `Flex Pass` tend to ride the bikes for about 10 - 60 minutes on average
    - People who hold `Monthly Pass` tend to ride the bikes for about 10 - 20 minutes on average
    - People who `Walk-up` tend to ride the bikes for about 50 - 80 minutes on average
    - People who hold `One Day Pass` tend to ride the bikes about 40 - 90 minutes on average
    - People who hold `Annual Pass` tend to ride the bikes about 10 - 120 minutes on average`
    - Line Chart :
        - implemented by `d3.js`
        - it will automatically adjust the size based on the screen size (responsive chart)
        - it support well visual queries : `years`, `click legend to toggle visbility of specific passholder type` (interactive chart)
        - it animates the chart and axis when data changes (d3 animated transitions)
- Bike Type Usage Growth
    - The usage of `electric bike` started to grow up since May 2019 to Sep 2019 
    - The usage of `standard bike` started to decrease from Oct 2018 to Sep 2019.
    - The usage of `smart bike` increases slowly from the trend of Feb 2019 to Sep 2019.
    - Group Bar Chart :
        - implemented by `d3.js`
        - it will automatically adjust the size based on the screen size (responsive chart)
        - it support well visual queries : `years`, `click legend to toggle visbility of specific bike type` (interactive chart)
        - it animates the chart and axis when data changes (d3 animated transitions)
- Bike Station Inbound and Outbound
    - We also want to see each station's inbound and outbound, which allows us to see where people, who rent the bikee, come from and head to which stations. 
    - The chart will be able users to select a specific station and years to show the circle packing layout of inbound and outbound stations.
    - Circle Packing Layout :
        - implemented by `d3.js`
        - it will automatically adjust the size based on the screen size (responsive chart)
        - it support well visual queries : `select a station`, `years` and albe to `zoom in`, `zoom out` when click the bubble (interactive chart)
        - it animates the chart and axis when data changes (d3 animated transitions)

## Slide 10 Explain what you would have done differently.
- Analyze whether users' gender and age will be factors that affect them using metro bikes
- Analyze whether people use metro bikes more often in holidays or in weekdays
- Analyze whether LA weather data / temperature will affect people using metro bikes


## Reference
- Design timeline
    - Ideation, Dataset, UI Mockup, front end, back end, publishing, feedback and development. We have accomplished the project in 5 phases. 
    - First we ideated wherein we thought about what to implement and where to get the data from. 

    - Then we planned what all visualizations to use, based on researching already existing systems and visualizations. 

    - In the third phase we implemented the front end first and then the back end. 

    - In the 4th phase we published our project and rendering feedback forms. 

    - In the last phase tried to improve the system based on the feedbacks acquired.

- Design Consideration
    - Cairo wheel: we followed the cairo wheel to maintain balance between all functionalities such as unidimensionality and multidimensionality, abstraction and figuration.

- Color Scheme
    - We have used blue color throughout our project so that it would address colour blind people as well. D3 scaleLinear and scaleOrdinal have been used for the visualizations.





