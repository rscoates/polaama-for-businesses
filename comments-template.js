<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="https://code.jquery.com/mobile/1.4.5/jquery.mobile-1.4.5.min.css">
<script src="https://code.jquery.com/jquery-1.11.3.min.js"></script>
<script src="https://code.jquery.com/mobile/1.4.5/jquery.mobile-1.4.5.min.js"></script>
</head>
<body>

<div data-role="page" id="pageone">
  <div data-role="header">
    <h1>${tripName} comments</h1>
  </div>

  <div data-role="main" class="ui-content">
    <div data-role="collapsibleset">
      <div data-role="collapsible" data-collapsed-icon="carat-r" data-expanded-icon="carat-d">
        <h1>Activities</h1>
        <p>${activityList}</p>
      </div>
      <div data-role="collapsible" data-collapsed-icon="carat-r" data-expanded-icon="carat-d">
        <h1>Stay details</h1>
        <p>${stayList}</p>
      </div>
      <div data-role="collapsible" data-collapsed-icon="carat-r" data-expanded-icon="carat-d">
        <h1>Flight details</h1>
        <p>${flightList}</p>
      </div>
      <div data-role="collapsible" data-collapsed-icon="carat-r" data-expanded-icon="carat-d">
        <h1>Rental car details</h1>
        <p>${rentalCarList}</p>
      </div>
      <div data-role="collapsible" data-collapsed-icon="carat-r" data-expanded-icon="carat-d">
        <h1>Other comments</h1>
        <p>${otherComments}</p>
      </div>
    </div>
  </div>
  
  <div data-role="footer">
    <h1>2016 Polaama, Inc. All rights reserved.</h1>
  </div>
</div> 

</body>
</html>

