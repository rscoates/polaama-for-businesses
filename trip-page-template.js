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
    <h1>${tripName} details</h1>
  </div>

  <div data-role="main" class="ui-content">
    <div data-role="collapsibleset">
      <div data-role="collapsible" data-collapsed-icon="carat-r" data-expanded-icon="carat-d">
        <h1>Todo list</h1>
        <p>${todoList}</p>
      </div>
      <div data-role="collapsible" data-collapsed-icon="carat-r" data-expanded-icon="carat-d">
        <h1>Pack list</h1>
        <div data-role="collapsible" data-collapsed-icon="carat-r" data-expanded-icon="carat-d">
          <h1>To pack</h1>
          <p>${toPackList}</p>
        </div>
        <div data-role="collapsible" data-collapsed-icon="carat-r" data-expanded-icon="carat-d">
          <h1>Done</h1>
          <p>${donePackList}</p>
        </div>
      </div>
      <div data-role="collapsible" data-collapsed-icon="carat-r" data-expanded-icon="carat-d">
        <h1>${header1}</h1>
        <p>${list1}</p>
      </div>
      <div data-role="collapsible" data-collapsed-icon="carat-r" data-expanded-icon="carat-d">
        <h1>${header2}</h1>
        <p>${list2}</p>
      </div>
      <div data-role="collapsible" data-collapsed-icon="carat-r" data-expanded-icon="carat-d">
        <h1>${header3}</h1>
        <p>${list3}</p>
      </div>
      <div data-role="collapsible" data-collapsed-icon="carat-r" data-expanded-icon="carat-d">
        <h1>${header4}</h1>
        <p>${list4}</p>
      </div>
      <div data-role="collapsible" data-collapsed-icon="carat-r" data-expanded-icon="carat-d">
        <h1>${header5}</h1>
        <p>${list5}</p>
      </div>
    </div>
  </div>
  
  <div data-role="footer">
    <h1>2016 Polaama, Inc. All rights reserved.</h1>
  </div>
</div> 

</body>
</html>

