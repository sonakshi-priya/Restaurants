$(window).on('load', function() {
    const API_KEY = "349dcf357f36d4964bdae04783aaf185";
    var location;
    var latitude, longitude;
    var restaurants;
    var cnt = 0;
    var remaining = 0;
    navigator.geolocation.getCurrentPosition(function (position) {
            getUserAddressBy(position.coords.latitude, position.coords.longitude)
        },
        function (error) {
            console.log("The Locator was denied :(")
        });

    function getUserAddressBy(lat, long) {
        var xhttp = new XMLHttpRequest();
        latitude = lat;
        longitude = long;

        xhttp.onreadystatechange = function () {
            // console.log (this.responseText);
            if (this.readyState == 4 && this.status == 200) {
                var data = JSON.parse(this.responseText);
                location = data.location_suggestions[0];
                var city = location.name;
                $("#city_id_selected_dropdown").text (city);
                $("#city_name_best").text (city);
                // city_id_selected_dropdown = city;
                console.log(city);
                cnt = 0;
                getAllEstablishments();
                return;
            }
        };
        let getCityUrl = "https://developers.zomato.com/api/v2.1/cities?lat=" + lat + "&lon=" + long;
        
        xhttp.open("GET", getCityUrl, true);
        xhttp.setRequestHeader("user-key", API_KEY);
        xhttp.send();
    }

    function getAllRestaurants (data) {
        if (cnt == 0) {
            console.log(data);
            // {
            //     "establishments": [
            //         {
            //             "id": ,
            //             "name": 
            //         }
            //     ]
            // }
            restaurants = [];
            establishments = data.establishments;
            remaining = establishments.length;
            for (let i = 0; i < establishments.length; i++) {
                let est_id = establishments[i].id;
                getRestaurants (est_id);
            }
            cnt++;
        }
    }

    function getRestaurants (est_id) {
        let cityId = location.id;
        let getResUrl = "https://developers.zomato.com/api/v2.1/search?entity_id=" + cityId + "&establishment_type=" + est_id;
        var xhttp = new XMLHttpRequest();
        var handleResponse = function () {
            // console.log (this.responseText);
            var cc = 0;
            if (this.readyState == 4 && this.status == 200 && (cc === 0)) {
                try {
                    var data = JSON.parse(this.responseText);
                    cc++;
                    xhttp.removeEventListener ("readystatechange", handleResponse);
                    var R = data.restaurants;
                    for (let i = 0; i < R.length; i++) {
                        let res_id = R[i].restaurant.id;
                        let res_name = R[i].restaurant.name;
                        let type = est_id;
                        restaurants.push ({
                            id : res_id,
                            name: res_name,
                            type : type,
                        });
                    }
                } catch (error) {
                    console.log (error);
                }
                remaining--;
                console.log (remaining);
                if (remaining === 0) {
                    console.log (remaining);
                    initializeAutoComplete ();
                }
            }
        };
        xhttp.onreadystatechange = handleResponse;
        xhttp.open("GET", getResUrl, true);
        xhttp.setRequestHeader("user-key", API_KEY);
        xhttp.send();
    }

    function initializeAutoComplete () {
        $("#res_search_box").autocomplete ({
            source : restaurants.map ((res, ind) => {return {label : res.name, value : res.name + "|" + res.id}}),
            minLength : 3,
        });
    }

    $("#get_review_buttion").on ('click', function () {
        console.log("one");
        
        let s = $("#res_search_box").val();
        try {
            let name_id = s.split ("|");
            let id = name_id[name_id.length - 1]
            // Get Reviewes for restaurant with id = id
            getReviewes (id);
        } catch (error) {
            
        }
    })

    function getReviewes (id) {
        console.log("two");
        
        let getReviewUrl = "https://developers.zomato.com/api/v2.1/reviews?res_id=" + id;
        console.log (getReviewUrl);
        var xhttp = new XMLHttpRequest();
        var handleResponse = function () {
            // console.log (this.responseText);
            if (this.readyState == 4 && this.status == 200) {
                try {
                    var data = JSON.parse(this.responseText);
                    displayReviewes (data);
                } catch (error) {
                    console.log (error);
                }
                
            }
        };
        xhttp.onreadystatechange = handleResponse;
        xhttp.open("GET", getReviewUrl, true);
        xhttp.setRequestHeader("user-key", API_KEY);
        xhttp.send();
    }

    function displayReviewes (reviewes) {
        console.log ("three");
        reviewes = reviewes.user_reviews;
        console.log (reviewes);
        $("#reviewes").empty();
        for (let i = 0; i < reviewes.length; i++) {
            let r = reviewes[i]['review'];
            if (r.review_text === "") continue;
            $("#reviewes").append (
                "<div>" + r.review_text + "<hr/></div>"
            );
        }
    }

    function getAllEstablishments () {
        let cityId = location.id;
        let getEstablishmentsUrl = "https://developers.zomato.com/api/v2.1/establishments?city_id=" + cityId;
        var xhttp = new XMLHttpRequest();
        var handleResponse = function () {
            // console.log (this.responseText);
            if (this.readyState == 4 && this.status == 200) {
                try {
                    var data = JSON.parse(this.responseText);
                    getAllRestaurants (data);
                } catch (error) {
                    console.log (error);
                }
                
            }
        };
        xhttp.onreadystatechange = handleResponse;
        xhttp.open("GET", getEstablishmentsUrl, true);
        xhttp.setRequestHeader("user-key", API_KEY);
        xhttp.send();
    }

});
