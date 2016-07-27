var unit = [];
var fireHouse = [];
var hotPt = [];
$(function () {
    $("#get-btn").on("click", function () {
        connect("sensor");
    });
    $("#get-firehouse").on("click", function () {
        Housename = addFirehouse();
    });
    $("#get-distance").on("click", function () {
        fireHappen();
    });
    $("#set-record").on("click", function () {
        alert(str);
    });
    $("#show-hotpt").on("click", function () {
        hotPt = [];
        connect("focususer");
        setTimeout(function () {
            if (hotPt) {
                addDataPoint();
            }
        }, 1000);
    });
    $("#hide-hotpt").on("click",function(){
        hideHot(); 
    });
});
function connect(type) {
    $.ajax({
        type: "get",
        url: "http://localhost:8084/YaoCity/firedefense",
        data: {
            "type": type
        },
        success: function (data) {
            var len = data.length;
            var coordx = [], coordy = [];
            var content = data.substring(1, len - 1);
            var coords = content.split(",");
            var convertor = new BMap.Convertor();
            for (var num = 0; num < coords.length / 10; num++) {
                for (var i = num * 10; i < num * 10 + 10; i++) {
                    var point = coords[i].trim().substring(6, coords[i].trim().length - 1);
                    coordx.push(point.split(" ")[0]);
                    coordy.push(point.split(" ")[1]);
                }
                var pointArr = [];
                for (var i = num * 10; i < num * 10 + 10; i++) {
                    var ggPoint = new BMap.Point(coordx[i], coordy[i]);
                    pointArr.push(ggPoint);
                }
                convertor.translate(pointArr, 1, 5, function (data) {
                    if (data.status === 0) {
                        for (var i = 0; i < data.points.length; i++) {
                            hotPt.push(data.points[i]);
                            var mark = new BMap.Marker(data.points[i]);
                            unit.push(mark);
                            map.addOverlay(mark);
                        }
                    }
                });
            }
        },
        error: function () {
            alert("网络错误");
        }
    });
}
function addFirehouse() {
    var name = [];
    $.ajax({
        type: "get",
        url: "http://localhost:8084/YaoCity/firedefense",
        data: {
            "type": "firehouse"
        },
        success: function (data) {
            var content = data.substring(1, data.length - 1);
            var firePt = content.split(",");
            var coordx = [], coordy = [], coords = [];
            for (var i = 0; i < firePt.length; i++) {
                name.push(firePt[i].split("_")[0]);
                coords.push(firePt[i].split("_")[1]);
            }
            for (var i = 0; i < coords.length; i++) {
                coordx.push(coords[i].trim().split(" ")[0]);
                coordy.push(coords[i].trim().split(" ")[1]);
            }
            ;
            var myIcon = new BMap.Icon("img/fireHouse3.png", new BMap.Size(32, 32));
            var opts = {
                width: 220, // 信息窗口宽度
                height: 60, // 信息窗口高度
                enableMessage: false //设置允许信息窗发送短息
            };
            for (var i = 0; i < coordx.length; i++) {
                var ggPoint = new BMap.Point(coordx[i], coordy[i]);
                fireHouse[i] = new BMap.Marker(ggPoint, {icon: myIcon});
                map.addOverlay(fireHouse[i]);
                fireHouse[i].addEventListener("click", function () {
                    var index = fireHouse.indexOf(this);
                    var infoWindow = new BMap.InfoWindow(name[index], opts);  // 创建信息窗口对象 
                    map.openInfoWindow(infoWindow, this.getPosition()); //开启信息窗口
                });
            }
            ;
            var tc = new BMapLib.TrafficControl();
            map.addControl(tc);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert("网络故障!");
        }
    });
    return name;
}
function fireHappen() {
    var minDis = 10000;
    var houseNum1 = 0, houseNum2 = 0;
    var unitNum = Math.floor(Math.random() * 100);
    var date = new Date();
    var curTime = date.toLocaleString();
    alert(unitNum + "号注册单位发生火灾！");
    for (var i = 0; i < fireHouse.length; i++) {
        if (map.getDistance(fireHouse[i].getPosition(), unit[unitNum].getPosition()) < minDis) {
            minDis = map.getDistance(fireHouse[i].getPosition(), unit[unitNum].getPosition());
            houseNum2 = houseNum1;
            houseNum1 = i + 1;
        }
    }
    var circle = new BMap.Circle(unit[unitNum].getPosition(), minDis, {fillColor: "blue", strokeWeight: 1, fillOpacity: 0.3, strokeOpacity: 0.3});
    map.addOverlay(circle);
    unit[unitNum].setAnimation(BMAP_ANIMATION_BOUNCE);
    var driving = new BMap.DrivingRoute(map, {renderOptions: {map: map, autoViewport: true}, policy: BMAP_DRIVING_POLICY_LEAST_TIME});
    driving.search(fireHouse[houseNum1 - 1].getPosition(), unit[unitNum].getPosition());
    var driving2 = new BMap.DrivingRoute(map, {renderOptions: {map: map, autoViewport: true}, policy: BMAP_DRIVING_POLICY_LEAST_TIME});
    driving2.search(fireHouse[houseNum2 - 1].getPosition(), unit[unitNum].getPosition());
    alert(Housename[houseNum1 - 1] + "出警！" + "最短距离为" + minDis);
    str = '{"sensorId":' + unitNum + ',"Time":' + curTime + ',"fireHouseId":' + houseNum1 + '"fireType":"A","lossRep":0}';
}
function addDataPoint() {
    var points = new Array();
    for (var i = 0; i < hotPt.length; i++) {
        var json = {"lng": hotPt[i].lng, "lat": hotPt[i].lat, "count": Math.floor(Math.random() * 100)};
        points.push(json);
    }
    heatmapOverlay = new BMapLib.HeatmapOverlay({"radius":40});
    map.addOverlay(heatmapOverlay);
    heatmapOverlay.setDataSet({data: points, max: 20});
    heatmapOverlay.show();
}
function hideHot(){
    heatmapOverlay.hide();
}