$(document).ready(function() {
    var students, filtered, groups,
        student_block = _.template('<div id="<%= id %>" class="col-xs-3 student-block"><div><ul class="list-unstyled"><li><h3><%= name %></h3></li><li><strong>Github:</strong><br /><a href="<%= github %>"><%= github %></a></li><li><strong>Courses:</strong><ul class="list-inline"> <% _.forEach(courses, function(course) { %><li><%- course.name %> - <%- course.group %><% }); %></ul></li></ul></div></div>');

    var idGenerator = (function() {
        var count = 0;

        return (function() {
            count += 1;
            return count;
        });
    } ());

    var sorting_function = function(fst, snd) {
        if(fst.available && !snd.available) { return -1; }
        if(!fst.available && snd.available) { return 1; }
        if(fst.courses.length === 0) { return 1; }
        if(snd.courses.length === 0) { return -1; }
        if(fst.courses[0].name < snd.courses[0].name) { return -1; }
        if(fst.courses[0].name > snd.courses[0].name) { return 1; }
        if(fst.name < snd.name) { return -1; }
        if(fst.name > snd.name) { return 1; }
        return 0;
    };

    var renderStudents = function (students_data) {
        var container = $('#students-grid'),
            new_elem;

        container.empty();

        students_data.forEach(function(student, i) {
            if (i % 4 === 0) {
                container.append('<div class="row"></div>');
            }

            new_elem = $(student_block(student));

            if (student.available === true) {
                new_elem.addClass('available');
            } else {
                new_elem.addClass('unavailable');
            }

            new_elem.on('click', function(e) {
                if(e.target.nodeName === 'A') { return; }
                $(this).toggleClass('available').toggleClass('unavailable');
                student.available = !student.available;
            });

            container.find('.row').last().append(new_elem);
        });
    };

    $.getJSON('https://hackbulgaria.com/api/students/', function(data) {
        students = data;

        students = students.map(function(x) { x.id = idGenerator(); return x; })
            .filter(function(x) { return x.name !== ''; });
        students.sort(sorting_function);

        filtered = students;

        renderStudents(students);
    });

    $('#filtering-options input[type=submit]').on('click', function() {
        var js_e = $('#early-javascript').is(':checked'),
            js_l = $('#late-javascript').is(':checked'),
            j_e = $('#early-java').is(':checked'),
            j_l = $('#late-java').is(':checked');

        if (js_e && js_l && j_e && j_l) {
            filtered = students;
            filtered.sort(sorting_function);
            renderStudents(filtered);
        } else if (!(js_e || js_l || j_e || j_l)) {
            $('#students-grid').empty().append('<h4 align="center">You haven\'t selected a group!</h4>');
        } else {
            filtered = [];
            filtered = students.filter(function(student) {
                if(js_e) {
                    if(student.courses.filter(function(x) { return x.name === 'Frontend JavaScript' && x.group === 1; }).length !== 0) {
                        return true;
                    }
                }
                if(js_l) {
                    if(student.courses.filter(function(x) { return x.name === 'Frontend JavaScript' && x.group === 2; }).length !== 0) {
                        return true;
                    }
                }
                if(j_e) {
                    if(student.courses.filter(function(x) { return x.name === 'Core Java' && x.group === 1; }).length !== 0) {
                        return true;
                    }
                }
                if(j_l) {
                    if(student.courses.filter(function(x) { return x.name === 'Core Java' && x.group === 2; }).length !== 0) {
                        return true;
                    }
                }
                return false;
            });

            filtered.sort(sorting_function);
            renderStudents(filtered);
        }
        return false;
    });

    var groupingFunction = function() {
        var modal = $('#groups-modal'),
            modal_body = modal.find('.modal-body'),
            groups_table = $('<table class="table table-striped center"></table>'),
            available_only = $('#group-available-only').is(':checked'),
            g_size = parseInt($('#group-size').val());

        if(available_only) {
            available_students = filtered.filter(function(student) {
                return student.available;
            });
            groups = groupIndexes(available_students.length, g_size)
                .map(function(group) { return group.map(function(j) { return available_students[j].name; }); });
        } else {
            groups = groupIndexes(filtered.length, g_size)
                .map(function(group) { return group.map(function(j) { return filtered[j].name; }); });
        }

        groups.forEach(function(group) {
            var new_row = $('<tr></tr>');

            group.forEach(function(student) {
                new_row.append('<td>' + student + '</td>');
            });

            groups_table.append(new_row);
        });

        modal_body.empty().append(groups_table);

        $('#save-groups').prop('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(groups)));

        modal.modal('show');
        return false;
    };

    $('#group-btn').on('click', function() {
        alert('Set apropriate group size!');
        return false;
    });

    $('#group-size').on('keyup', function() {
        var $this = $(this),
            size = parseInt($this.val());
        if(isNaN(size) || size <= 0) {
            $this.parent().addClass('has-error');
            $('#group-btn').unbind().on('click', function() {
                alert('Set apropriate group size!');
            });
        } else {
            $this.parent().addClass('has-success').removeClass('has-error');
            $('#group-btn').unbind().on('click', groupingFunction);
        }
    });

    var groupIndexes = function(a_size, g_size) {
        var arr = _.range(a_size),
            i,j,temp,
            groups_ind = [];

        for (i = a_size - 1; i >= 0; i--) {
            j = Math.floor(Math.random() * (i + 1));
            temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
        }

        for (i = 0; i < a_size / g_size; i++) {
            groups_ind.push(arr.slice(i * g_size, (i + 1) * g_size));
        }

        return groups_ind;
    };
});
