Pretty table for a new publications page. [Site here](https://uwctri.github.io/Publications-Demo/)

* style.css contains all UW default styling, nothing new
* site.js holds all of the important stuff
* The only new tags in the index are the "New CDNs" section and `<table id="mainDataTable"></table>`

The [site was taken live](https://ctri.wisc.edu/researchers/uw-ctri-research-papers/) by inserting the below into WiscWeb

```
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js" integrity="sha384-MrcW6ZMFYlzcLA8Nl+NtUVF0sA7MsXsP1UyJoMp4YLEuNSfAP+JcXn/tWtIaxVXM" crossorigin="anonymous"></script>
<script src="https://cdn.datatables.net/1.11.3/js/jquery.dataTables.min.js"></script>
<script src="https://cdn.datatables.net/1.11.3/js/dataTables.bootstrap5.min.js"></script>
<script src="https://uwctri.github.io/Publications-Demo/site.js"></script>
<script src="https://uwctri.github.io/Publications-Demo/pubList.js"></script>
<link rel="stylesheet" src="https://uwctri.github.io/Publications-Demo/site.css" media="all">
```
