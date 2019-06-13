var mysql = require('mysql')
var pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '6963038',
    database: 'AcademicSystem'
})

const express = require('express');
const app = express(),
      bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.use(express.static('public'))

app.post('/validate', (req, res) => {
    let account = req.body.account;
    let password = req.body.password;
    let type = req.body.type;
    validate(type, account, password, res);
});

app.get('/student', (req, res) => {
    let account = req.query.account;

    getStudentInfor(account, res);
})

app.get('/teacher', (req, res) => {
    let account = req.query.account;

    getTeacherInfor(account, res);
})

app.get('/lesson', (req, res) => {
    getLessonInfor(res);
})

app.post('/lesson', (req, res) => {
    let lesson_no = req.body.lesson_no;
    let name = req.body.name;
    let tno = req.body.tno;
    let type = req.body.type;
    let credit = req.body.credit;

    addLesson(lesson_no, name, tno, type, credit, res);
});

app.get('/student/lesson', (req, res) => {
    let account = req.query.account;
    
    getStudentLesson(account, res);
})

app.post('/student/lesson', (req, res) => {
    let account = req.body.account;
    let lesson_no = req.body.lesson_no;

    attendLesson(account, lesson_no, res);
})

app.delete('/student/lesson', (req, res) => {
    let account = req.query.account;
    let lesson_no = req.query.lesson_no;

    dropLesson(account,lesson_no,res);
})

app.get('/teacher/lesson', (req, res) => {
    let account = req.query.account;
    
    teacherGetLesson(account, res);
})

app.get('/lesson/student', (req, res) => {
    let lesson_no = req.query.lesson_no;

    lessonStudent(lesson_no, res);
})

app.get('/lesson/score', (req, res) => {
    let sno = req.query.sno;
    let lesson_no = req.query.lesson_no;
    let score = req.query.score;
    
    setScore(sno, lesson_no, score, res);
})

app.get('/student/password', (req, res) => {
    let sno = req.query.sno;
    let password = req.query.password;
    
    studentChangePassword(sno, password, res);
})

app.get('/teacher/password', (req, res) => {
    let tno = req.query.tno;
    let password = req.query.password;
    
    teacherChangePassword(tno, password, res);
})

app.listen(3000, () => console.log('App listening on port 3000!'))




function validate(type, account, password, res) {
    pool.getConnection((err, conn) => {
        let sql = null;
        if (type == "teacher") {
            sql = "SELECT COUNT(*) as num FROM `teacher_account` WHERE `tno` = ? and `password` = ?";
        } else {
            sql = "SELECT COUNT(*) as num FROM `student_account` WHERE `sno` = ? and `password` = ?";
        }
        conn.query(sql, [account, password], (error, results, fields) => {
            if(err) {
                res.json({ success: false }).end();
            }
            if(results[0].num === 1) {
                res.json({success: true}).end();
            } else {
                res.json({success: false}).end();
            }
            conn.release();
        });
    });
}

function getStudentInfor(account, res) {
    pool.getConnection((err, conn) => {
        let sql = "SELECT sno, student.name as name, DATE_FORMAT(admission_date,'%Y年%m月%d日') as admission_date, DATE_FORMAT(birthday,'%Y年%m月%日') as birthday, school.name as school, class.name as class, tel, sex, nation FROM student inner join school on school.school_no = student.school_no inner join class on class.class_no = student.class_no where student.sno = ?";
        conn.query(sql, [account], (err, results, fields) => {
            if(err) {
                res.json({ success: false }).end();
            }
            if(results.length !== 0) {
                res.json({success: true, data: results[0]}).end();
            } else {
                res.json({success: false}).end();
            }
            conn.release();
        });
    });
}

function getTeacherInfor(account, res) {
    pool.getConnection((err, conn) => {
        let sql = "SELECT tno, name, title  from teacher where tno = ?";
        conn.query(sql, [account], (err, results, fields) => {
            if(err) {
                res.json({ success: false }).end();
            }
            if(results.length !== 0) {
                res.json({success: true, data: results[0]}).end();
            } else {
                res.json({success: false}).end();
            }
            conn.release();
        });
    });
}

function getLessonInfor(res) {
    pool.getConnection((err, conn) => {
        let sql = "select lesson.name as name, lesson_no, teacher.name as teacher, type, credit from lesson inner join teacher on teacher.tno = lesson.tno";
        conn.query(sql, (err, results, fields) => {
            if(err) {
                res.json({ success: false }).end();
            }
            if(results.length !== 0) {
                res.json({success: true, data: results}).end();
            } else {
                res.json({success: true, data: []}).end();
            }
            conn.release();
        });
    });
}

function getStudentLesson(account, res) {
    pool.getConnection((err, conn) => {
        let sql = "select lesson.lesson_no as lesson_no, lesson.name as name, score from student_lesson inner join lesson on lesson.lesson_no = student_lesson.lesson_no where sno = ?";
        conn.query(sql, [account], (err, results, fields) => {
            if(err) {
                res.json({ success: false }).end();
            }
            if(results.length !== 0) {
                res.json({success: true, data: results}).end();
            } else {
                res.json({success: true, data: []}).end();
            }
            conn.release();
        });
    });
}

function attendLesson(account, lesson_no, res) {
    pool.getConnection((err, conn) => {
        let sql = "insert into student_lesson (sno, lesson_no) values (?, ?)";
        conn.query(sql, [account,lesson_no], (err,results,fields) => {
            if(err) {
                res.json({ success: false }).end();
            } else {
                res.json({success: true}).end();
            }
            conn.release();
        })
    })    
}

function dropLesson(account, lesson_no, res) {
    pool.getConnection((err, conn) => {
        let sql = "delete from student_lesson where sno = ? and lesson_no = ?";
        conn.query(sql, [account,lesson_no], (err,results,fields) => {
            if(err) {
                res.json({ success: false }).end();
            } else {
                res.json({success: true}).end();
            }
            conn.release();
        })
    })    
}

function teacherGetLesson(account, res) {
    pool.getConnection((err, conn) => {
        let sql = "select * from lesson where tno = ?";
        conn.query(sql, [account], (err, results, fields) => {
            if(err) {
                res.json({success: false}).end();
            } else {
                res.json({success: true, data: results}).end();
            }
            conn.release();
        })
    })
}

function lessonStudent(lesson_no, res) {
    pool.getConnection((err, conn) => {
        let sql = "select student_lesson.lesson_no as lesson_no, student.sno as sno, student.name as name, score from student_lesson inner join student on student.sno = student_lesson.sno where student_lesson.lesson_no = ?";
        conn.query(sql, [lesson_no], (err, results, fields) => {
            if(err) {
                console.log(err);
                res.json({success:false}).end();
            } else {
                res.json({success: true, data: results}).end();
            }
            conn.release();
        })
    })
}

function setScore(sno, lesson_no, score, res) {
    pool.getConnection((err, conn) => {
        let sql = "update student_lesson set score = ? where sno = ? and lesson_no = ?";
        conn.query(sql, [score, sno, lesson_no], (err, results, fields) => {
            if(err) {
                res.json({success: false}).end();
            } else {
                res.json({success: true}).end();
            }
            conn.release();
        })
    })
}

function studentChangePassword(sno, password, res) {
    pool.getConnection((err, conn) => {
        let sql = "update student_account set password = ? where sno = ?";
        conn.query(sql, [password, sno], (err, results, fields) => {
            if(err) {
                res.json({success: false}).end();
            } else {
                res.json({success: true}).end();
            }
            conn.release();
        })
    })
}

function teacherChangePassword(tno, password, res) {
    pool.getConnection((err, conn) => {
        let sql = "update teacher_account set password = ? where tno = ?";
        conn.query(sql, [password, tno], (err, results, fields) => {
            if(err) {
                res.json({success: false}).end();
            } else {
                res.json({success: true}).end();
            }
            conn.release();
        })
    })
}

function addLesson(lesson_no, name, tno, type, credit, res) {
    pool.getConnection((err, conn) => {
        let sql = "insert into lesson values (?, ?, ?, ?, ?)";
        conn.query(sql, [lesson_no, name, tno, type, credit], (err, results, fields) => {
            if(err) {
                res.json({success: false}).end();
            } else {
                res.json({success: true}).end();
            }
            conn.release();
        })
    })
}