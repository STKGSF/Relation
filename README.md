# Relation
人物关系图

#使用方法
####初始化
var rc = new RelationChart("#demo",{style:"background-color:#DDD;display:block;margin:0 auto;"});

####一次添加多个角色
var characters = [
    {id:'No.1',desc:"Character No.1",name:'C01'},
    {id:'No.2',desc:"Character No.2",name:'C02'},
    {id:'No.3',desc:"Character No.3",name:'C03'},
    {id:'No.4',desc:"Character No.4",name:'C04'},
    {id:'No.5',desc:"Character No.5",name:'C05'}
];
rc.addCharacter(characters);

####一次添加一个角色
rc.addCharacter({desc:"Character No.6",name:'C06'});

####添加关系
rc.addRelation("C01","C02","Test relation");
rc.addRelation("C01","C03","Test relation2");