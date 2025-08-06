TORTOISE_ORM={
        # 数据库连接配置
        'connections':{
            # 默认数据库连接
            'default': {
                # 使用MySQL数据库后端
                'engine':'tortoise.backends.mysql',
                'credentials': {
                    # 数据库主机地址
                    'host':'127.0.0.1',
                    # 数据库端口号
                    'port':3306,
                    # 数据库用户名
                    'user':'root',
                    # 数据库密码
                    'password':'123456',
                    # 要连接的数据库名
                    'database':'ai_production_system'
                }
            }
        },
        # 应用程序配置
        'apps':{
            # 模型应用配置
            'models':{
                # 包含的模型列表
                'models':['models.models','aerich.models'],
                # 默认数据库连接
                'default_connection':'default',
            }
        },
        # 是否使用时区
        'use_tz':False,
        # 设置时区为上海
        'timezone':'Asia/Shanghai',
    }
